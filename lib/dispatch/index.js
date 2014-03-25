/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

var
  joola = require('../joola.io'),

  fs = require('fs'),
  path = require('path'),
  redis = require('redis'),
  ce = require('cloneextend'),
  _ = require('underscore');

var dispatch = module.exports;

dispatch.init = function (callback) {
  try {
    var self = dispatch;

    self.namespace = 'dispatch';
    self.host = joola.config.store.dispatch.redis.host || 'localhost';
    self.port = joola.config.store.dispatch.redis.port || 6379;
    self.db = joola.config.store.dispatch.redis.db || 0;
    self.auth = joola.config.store.dispatch.redis.auth;
    self.redis = redis.createClient(self.port, self.host);
    self.publisher = redis.createClient(self.port, self.host);
    self.subscriber = redis.createClient(self.port, self.host);

    self.subscribed = false;
    self.subscriptions = [];
    self.listeners = [];

    self.tracers = [];

    self.redis.select(self.db);
    self.publisher.select(self.db);
    self.subscriber.select(self.db);

    if (self.auth) {
      self.redis.auth(self.auth);
      self.publisher.auth(self.auth);
      self.subscriber.auth(self.auth);
    }

    self.publisher.on('connect', function () {
      joola.logger.debug('[publisher] Connected to redis @ ' + self.host + ':' + self.port + '#' + self.db);
      joola.state.set('publisher', 'working', 'redis [publisher] is up.');
    });
    // Suppress errors from the Redis client
    self.publisher.on('error', function (err) {
      joola.state.set('publisher', 'failure', 'redis [publisher] is down: ' + (typeof(err) === 'object' ? err.message : err));
    });
    self.subscriber.on('connect', function () {
      joola.logger.debug('[subscriber] Connected to redis @ ' + self.host + ':' + self.port + '#' + self.db);
      joola.state.set('subscriber', 'working', 'redis [subscriber] is up.');
    });
    self.subscriber.on('error', function (err) {
      joola.state.set('subscriber', 'failure', 'redis [subscriber] is down: ' + (typeof(err) === 'object' ? err.message : err));
    });

    dispatch.subscriber.on('message', dispatch.router);

    joola.events.emit('dispatch:ready');
    return callback(null);
  }
  catch (ex) {
    console.log(ex);
    return callback(ex);
  }
};

dispatch.hook = function () {
  fs.readdirSync(path.join(__dirname, './')).forEach(function (file) {
    if (file != 'index.js' && file != 'index2.js' && file != 'prototypes') {
      try {
        var module = require('./' + file);
        var modulename = file.replace('.js', '');
        dispatch[modulename] = {};
        if (!joola[modulename])
          joola[modulename] = {};
        Object.keys(module).forEach(function (fn) {
          var _fn = module[fn];

          dispatch.setup(_fn, function (err) {
            if (err) {
              //do something
            }

            dispatch[modulename][fn] = _fn.run;
            if (!joola[modulename][fn])
              joola[modulename][fn] = _fn.run;
          });
        });
      } catch (ex) {
        console.log('Failure in loading dispatch module [' + file + ']: ' + ex);
        console.log(ex.stack);
      }
    }
  });
};

dispatch.setup = function (fn, callback) {
  var details = fn._dispatch;
  if (!details)
    return callback(new Error('Failed to locate _dispatch'));
  joola.logger.trace('[dispatch] Request to setup dispatch for [' + details.message + ']');

  var listener = _.find(dispatch.listeners, function (listener) {
    return listener._dispatch.message == details.message;
  });
  if (listener) {
    joola.logger.trace('[dispatch] Channel [' + details.message + '] already registered.');
    return callback('[dispatch] Channel [' + details.message + '] already registered.');
  }

  fn._dispatch = fn._dispatch || {};
  fn._dispatch.criteria = fn._dispatch.criteria || 'notme';
  fn._dispatch.limit = fn._dispatch.limit || 1;

  dispatch.listeners.push(fn);
  dispatch.subscriber.subscribe(details.message + '-request');
  dispatch.subscriber.subscribe(details.message + '-done');
  joola.logger.trace('[dispatch] Registered new listeners for channel [' + details.message + ']');
  return callback(null);
};

dispatch.router = function (channel, message) {
  if (global.stopped)
    return;

  var listeners;
  listeners = _.filter(dispatch.listeners, function (l) {
    return l._dispatch.message == channel.replace('-request', '').replace('-done', '');
  });
  listeners.forEach(function (listener) {
    if (!listener) {
      console.log('missing listener', channel);
      return;
    }
    if (!listener.run) {
      //joola.logger.trace('[router] received simple message on channel [' + channel + ']');
      joola.common.parse(message, function (err, message) {
        return listener._dispatch.cb.call(listener, channel, message);
      });
    }
    else {
      joola.logger.trace('[router] received message [' + message + '] on channel [' + channel + ']');

      //get the message
      joola.mongo.find('messages', 'aaa', {id: message}, {}, function (err, value) {
        //dispatch.redis.hgetall('messages:' + message, function (err, value) {
        if (err) {
          //do something
          return;
        }

        if (!value)
          return;
        message = value[0];

        dispatch.tracers.forEach(function (tracer) {
          if (joola.io) {
            var socket = joola.io.sockets.sockets[tracer];
            if (socket)
              socket.emit('dispatch', message);
          }
        });

        if (channel.indexOf('-request') > -1) {
          //we're dealing with a request

          joola.auth.getUserByToken(message.token, function (err, user) {
            if (err) {
              var _result = {
                err: err,
                message: null
              };
              dispatch.fulfill(message, _result);
            }
            /*
             if (!user) {
             var _result = {
             err: 'Failed to translate token to user.',
             message: null
             };
             dispatch.fulfill(message, _result);
             }*/

            var context = {};
            context.user = user;

            dispatch.qualifies(context, listener, message, function (err, qualified) {
              if (!qualified)
                return;

              var query = {
                id: message.id
              };
              var update = {
                $inc: {
                  picked: 1
                }
              };

              joola.mongo.findAndModify('messages', 'aaa', query, update, function (err, value) {
                value = value.picked;
                if (err)
                  return;
                //dispatch.redis.hincrby('messages:' + message.id, 'picked', 1, function (err, value) {
                message.picked = value;
                dispatch.shouldRun(listener, message, function (err, should) {
                  if (!should) {
                    joola.logger.trace('[router] should not run message [' + message.id + ']');
                    return;
                  }
                  var payload = message.payload;
                  //joola.common.parse(message.payload, function (err, payload) {
                  var _params = [];
                  _params.push(context);

                  if (payload && typeof payload === 'object') {
                    Object.keys(payload).forEach(function (key) {
                      _params.push(payload[key]);
                    });
                  }
                  else if (message.payload != '{}') {
                    _params.push(message.payload);
                  }
                  _params.push(function (err, result) {
                    delete arguments[0];
                    var _result = {
                      err: err,
                      message: arguments
                    };

                    dispatch.fulfill(message, _result);
                  });

                  try {
                    listener.run.apply(message, _params);
                  }
                  catch (ex) {
                    var _result = {
                      err: ex,
                      message: null
                    };
                    dispatch.fulfill(message, _result);
                  }
                  // });
                });
              });
            });
          });
        }
        else if (channel.indexOf('-done') > -1) {
          //we're dealing with the result

          if (typeof listener[message.id] === 'function') {
            var result = message.result;
            //joola.common.parse(message.result, function (err, result) {
            //try {
            var args = [];
            args.push(result.err);
            if (joola.common.typeof(result.message) === 'object') {
              Object.keys(result.message).forEach(function (key) {
                args.push(result.message[key]);
              });
            }
            else
              console.log('Weird result', result);

            delete message.result;
            delete message.payload;
            args.push(message);
            if (listener[message.id]) {
              listener[message.id].apply(listener, args);
              delete listener[message.id];
            }
            // }
            // catch (ex) {
            //    console.log('exception on done', ex);
            //do something
            //  }
            //    });
          }
        }
      });
    }
  });
};

dispatch.qualifies = function (context, listener, message, callback) {
  var qualifies = true;
  if (listener._dispatch.criteria) {
    switch (listener._dispatch.criteria) {
      case 'notme':
        joola.dispatch.system.nodeList(context, function (err, nodes) {
          var exist = _.find(nodes, function (n) {
            if (n && n['last-seen'] && n.state !== 'failure') {
              var lastSeen = new Date().getTime() - parseInt(n['last-seen']);
              return lastSeen < 5000 && n.uid != joola.UID;
            }
          });
          if (message.from == joola.UID && !exist) {
            joola.logger.trace('[router] Qualified [no candidates] to run [' + message.id + ']');
            qualifies = true;
          }
          else if (message.from == joola.UID) {
            joola.logger.trace('[router] not qualified to run [' + message.id + '], first example: ' + exist.uid);
            qualifies = false;
          }
          else {
            joola.logger.trace('[router] Qualified [opportunist] to run [' + message.id + ']');
            qualifies = true;
          }
          return callback(null, qualifies);
        });
        break;
      default:
        return callback(null, qualifies);
    }
  }
  else
    return callback(null, qualifies);
};

dispatch.shouldRun = function (listener, message, callback) {
  var result = false;
  if (!listener)
    return callback(new Error('Failed to locate listener for message [' + message.id + ']'));

  if (listener._dispatch.limit > -1) {
    if (message.picked <= listener._dispatch.limit)
      result = true;
  }
  else {
    result = true;
  }
  return callback(null, result);
};

dispatch.request = function (token, channel, params, callback) {
  var self = dispatch;
  var compiled = {
    id: joola.common.uuid(),
    timestamp: new Date().getTime(),
    'timestamp-nice': new Date(),
    from: joola.UID,
    token: token,
    to: 'any',
    picked: 0,
    fulfilled: 0,
    'fulfilled-by': null,
    'fulfilled-timestamp': null,
    'fulfilled-timestamp-nice': null,
    channel: channel
  };

  var listener = _.find(dispatch.listeners, function (l) {
    return (l._dispatch.message == channel);
  });

  if (!listener)
    return callback(new Error('Failed to locate listener for message [' + compiled.id + ']'));

  //joola.common.stringify(params, function (err, stringPayload) {
  compiled.payload = params;
  //var key = 'messages:' + compiled.id;
  joola.mongo.insert('messages', 'aaa', compiled, function (err) {
    //self.redis.hmset(key, compiled, function (err) {
    if (err)
      return callback(err);

    joola.common.stats({event: 'events-request', events: 1});
    //self.redis.expire(key, joola.config.dispatch.expires, function (err) {
    joola.logger.trace('Compiled request [' + compiled.id + '] for channel [' + channel + ']');
    dispatch.publisher.publish(channel + '-request', compiled.id);
    if (typeof callback === 'function')
      listener[compiled.id] = callback;
    //return callback(null, compiled);
    //});
  });
  //});
};

dispatch.fulfill = function (message, result, callback) {
  var self = dispatch;

  message.fulfilled = 1;
  message['fulfilled-by'] = joola.UID;
  message['fulfilled-timestamp'] = new Date().getTime();
  message['fulfilled-timestamp-nice'] = new Date();
  message['fulfilled-duration'] = parseInt(message['fulfilled-timestamp']) - parseInt(message.timestamp);

  message.result = result;
  joola.mongo.update('messages', 'aaa', {id: message.id}, message, {}, function (err) {
    //self.redis.hmset(key, message, function (err) {
    if (err)
      return callback(err);

    joola.common.stats({event: 'events-fulfilled', fulfilled: 1, fulfilledtime: message['fulfilled-duration']});
    //self.redis.expire(key, 10, function (err) {
    joola.logger.trace('[dispatch] Fulfilled request [' + message.id + '] for channel [' + message.channel + ']');
    dispatch.publisher.publish(message.channel + '-done', message.id, callback);
    //});
  });
};

dispatch.on = function (channel, callback, next) {
  callback = callback || emptyfunc;

  var exists = _.find(dispatch.listeners, function (listener) {
    return listener._dispatch.message == channel && (listener._dispatch.cb ? listener._dispatch.cb.toString() : null) == (callback ? callback.toString() : null);
  });
  if (!exists) {
    joola.logger.trace('[dispatch] listen on: ' + channel);
    var listener = {
      _dispatch: {
        message: channel,
        cb: callback
      }
    };
    dispatch.listeners.push(listener);
    dispatch.subscriber.subscribe(channel, next);
    return listener;
  }
  else {
    callback(new Error('listener on this channel already assigned with the same callback.'));
    return null;
  }
};

dispatch.once = function (channel, callback, next) {
  callback = callback || emptyfunc;

  var exists = _.find(dispatch.listeners, function (listener) {
    return listener._dispatch.message == channel && (listener._dispatch.cb ? listener._dispatch.cb.toString() : null) == (callback ? callback.toString() : null);
  });
  if (!exists) {
    joola.logger.trace('[dispatch] listen on: ' + channel);
    var listener = {
      _dispatch: {
        message: channel,
        cb: function () {
          var listener = dispatch.removeListener(this._dispatch.message, this._dispatch.cb);
          return callback.apply(this, arguments);
        }
      }
    };
    dispatch.listeners.push(listener);
    dispatch.subscriber.subscribe(channel, next);
    return listener;
  }
  else {
    callback(new Error('listener on this channel already assigned with the same callback.'));
    return null;
  }
};

dispatch.emit = function (channel, message, callback) {
  callback = callback || emptyfunc;
  if (dispatch.publisher) {
    dispatch.publisher.publish(channel, JSON.stringify(message), callback);
    joola.logger.trace('[dispatch] emit on: ' + channel);
  }
  else {
    joola.logger.warn('Dispatch emit before ready, channel [' + channel + ']');
    joola.logger.trace(message);
    return callback(new Error('Dispatch is not ready yet'));
  }
};

dispatch.removeListener = function (channel, cb) {
  var found = false;
  dispatch.listeners.forEach(function (listener, i) {
    if (listener._dispatch.message == channel && (listener._dispatch.cb ? listener._dispatch.cb.toString() : null) == (cb ? cb.toString() : null)) {
      found = dispatch.listeners.splice(i, 1);
    }
  });
  return found;
};

dispatch.removeAllListeners = function (channel) {
  var found = [];
  var indexes = [];
  dispatch.listeners.forEach(function (listener, i) {
    if (listener._dispatch.message == channel) {
      indexes.push(i);
    }
  });
  indexes.forEach(function (i, currentindex) {
    i = i - (currentindex);
    found.push(dispatch.listeners.splice(i, 1));
  });
  return found;
};