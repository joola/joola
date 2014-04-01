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

  util = require('util'),
  fs = require('fs'),
  path = require('path'),
  redis = require('redis'),
  ce = require('cloneextend'),

  Stomp = require('stomp'),

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
    self.redis.on('error', function (err) {
      joola.state.set('publisher', 'failure', 'redis [publisher] is down: ' + (typeof(err) === 'object' ? err.message : err));
      joola.state.set('subscriber', 'failure', 'redis [subscriber] is down: ' + (typeof(err) === 'object' ? err.message : err));
    });


  }
  catch (ex) {
    console.log(ex);
    return process.nextTick(function () {
      return callback(ex);
    });
  }

  var stompSettings = {
    "host": "localhost",
    "port": 61613,
    "user": "guest",
    "password": "guest",
    "debug": false
  };


  dispatch.listen = function (client, destination, selector, messageProcessorFunction) {
    var subscribeArgs = {
      destination: destination,
      //selector: 'RoutingKey LIKE '%s',
      ack: 'auto'
    };

    client.subscribe(subscribeArgs, messageProcessorFunction);
  };

  dispatch.publishMessage = function (client, message, queueName, routingKey, replyTo) {
    var publisherArgs = {
      body: JSON.stringify(message),
      persistent: 'true'
    };

    if (replyTo)
      publisherArgs['reply-to'] = '/temp-queue/' + queueName.replace('/queue/', '') + '.done';

    if (routingKey) {
      publisherArgs.RoutingKey = routingKey;
    }
    publisherArgs.destination = queueName;

    var wantReceipt = false;
    client.send(publisherArgs, wantReceipt);
  };

  var stompConnect = function () {
    var stompArgs = {
      host: stompSettings.host,
      port: stompSettings.port,
      login: stompSettings.user,
      passcode: stompSettings.password,
      debug: stompSettings.debug
    };

    dispatch.stompClient = new Stomp().Client(stompArgs);
    var connected = false;
    dispatch.stompClient.on('connected', function () {
      if (!connected) {
        connected = true;
        joola.events.emit('dispatch:ready');
        return process.nextTick(function () {
          return callback(null);
        });
      }
    });

    dispatch.stompClient.on('disconnected', function (reason) {
      //console.log(util.format("stomp.onDisconnect %s", reason));
      //dispatch.stompClient.connect();
    });

    dispatch.stompClient.on('receipt', function (receipt) {
      //console.log(util.format("stomp.onReceipt %s", receipt));
    });

    dispatch.stompClient.on('error', function (errorFrame) {
      //console.error(util.format("stomp.onError %s", JSON.stringify(errorFrame)));
      dispatch.stompClient.disconnect();

      // dispatch.stompClient.connect();
    });

    dispatch.stompClient.on('SIGINT', function () {
      //console.log(util.format("stomp.onSIGINT"));
      dispatch.stompClient.disconnect();
    });

    dispatch.stompClient.connect();
  };
  stompConnect();
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
    return process.nextTick(function () {
      return callback(new Error('Failed to locate _dispatch'));
    });

  var listener = _.find(dispatch.listeners, function (listener) {
    return listener._dispatch.message == details.message;
  });
  if (listener) {
    joola.logger.trace('[dispatch] Channel [' + details.message + '] already registered.');
    return process.nextTick(function () {
      return callback('[dispatch] Channel [' + details.message + '] already registered.');
    });
  }

  fn._dispatch = fn._dispatch || {};
  fn._dispatch.criteria = fn._dispatch.criteria || 'notme';
  fn._dispatch.limit = fn._dispatch.limit || 1;

  dispatch.listeners.push(fn);
  dispatch.subscriber.subscribe(details.message + '-request');
  dispatch.subscriber.subscribe(details.message + '-done');

  dispatch.listen(dispatch.stompClient, '/queue/joola.dispatch.' + details.message.replace(':', '.'), "", function name(message, headers) {
    dispatch.processMessage(message, headers);
  });

  dispatch.listen(dispatch.stompClient, '/temp-queue/joola.dispatch.' + details.message.replace(':', '.') + '.done', "", function name(message, headers) {
    dispatch.fulfillRequest(message, headers);
  });

  return process.nextTick(function () {
    return callback(null);
  });
};
var first = false;

dispatch.processMessage = function (message, headers) {
  message = message[0];
  message = JSON.parse(message).message;

  var _result;
  joola.auth.getUserByToken(message.token, function (err, user) {
    if (err) {
      _result = {
        err: err,
        message: null
      };
      dispatch.fulfill(message, _result, headers);
    }
    var context = {};
    context.user = user;

    var payload = message.payload;
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
      _result = {
        err: err,
        message: arguments
      };

      dispatch.fulfill(message, _result, headers);
    });

    try {
      var listeners = _.filter(dispatch.listeners, function (l) {
        return l._dispatch.message === headers.destination.replace('/queue/joola.dispatch.', '').replace('.', ':');
      });
      listeners.forEach(function (listener) {
        listener.run.apply(message, _params);
      });
    }
    catch (ex) {
      _result = {
        err: ex,
        message: null
      };
    }
  });
};

dispatch.fulfillRequest = function (message, headers) {
  message = message[0];
  message = JSON.parse(message);
  var listeners = _.filter(dispatch.listeners, function (l) {
    return l._dispatch.message === headers.subscription.replace('/temp-queue/joola.dispatch.', '').replace('.', ':').replace('.done', '');
  });
  listeners.forEach(function (listener) {
    if (typeof listener[message.id] === 'function') {
      var result = message.result;
      var args = [];
      args.push(result.err);
      if (joola.common.typeof(result.message) === 'object') {
        Object.keys(result.message).forEach(function (key) {
          args.push(result.message[key]);
        });
      }
      else
        console.log('Weird result', message);

      delete message.result;
      delete message.payload;
      args.push(message);

      if (listener[message.id]) {
        listener[message.id].apply(listener, args);
        delete listener[message.id];
      }
    }
  });
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
      joola.common.parse(message, function (err, message) {
        return process.nextTick(function () {
          return listener._dispatch.cb.call(listener, channel, message);
        });
      });
    }
    else {
      joola.logger.trace('[router] received message [' + message + '] on channel [' + channel + ']');

      //get the message
      joola.mongo.find('messages', 'router', {id: message}, {}, function (err, value) {
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
          processMessage = function (message, headers) {
            joola.auth.getUserByToken(message.token, function (err, user) {
              if (err) {
                var _result = {
                  err: err,
                  message: null
                };
                dispatch.fulfill(message, _result, headers);
              }
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

                joola.mongo.findAndModify('messages', 'router', query, update, function (err, value) {
                  value = value.picked;
                  if (err)
                    return;
                  message.picked = value;
                  dispatch.shouldRun(listener, message, function (err, should) {
                    if (err)
                      console.log('should run error:' + err);
                    if (!should) {
                      joola.logger.trace('[router] should not run message [' + message.id + ']');
                      return;
                    }
                    var payload = message.payload;
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

                      dispatch.fulfill(message, _result, headers);
                    });

                    try {
                      listener.run.apply(message, _params);
                    }
                    catch (ex) {
                      var _result = {
                        err: ex,
                        message: null
                      };
                      dispatch.fulfill(message, _result, headers);
                    }
                  });
                });
              });
            });
          }
        }
        else if (channel.indexOf('-done') > -1) {
          //we're dealing with the result

          if (typeof listener[message.id] === 'function') {
            var result = message.result;
            var args = [];
            args.push(result.err);
            if (joola.common.typeof(result.message) === 'object') {
              Object.keys(result.message).forEach(function (key) {
                args.push(result.message[key]);
              });
            }
            else
              console.log('Weird result', message);

            delete message.result;
            delete message.payload;
            args.push(message);
            if (listener[message.id]) {
              listener[message.id].apply(listener, args);
              delete listener[message.id];
            }
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
          return process.nextTick(function () {
            return callback(null, qualifies);
          });
        });
        break;
      default:
        return process.nextTick(function () {
          return callback(null, qualifies);
        });
    }
  }
  else
    return process.nextTick(function () {
      return callback(null, qualifies);
    });
};

dispatch.shouldRun = function (listener, message, callback) {
  var result = false;
  if (!listener)
    return process.nextTick(function () {
      return callback(new Error('Failed to locate listener for message [' + message.id + ']'));
    });

  if (listener._dispatch.limit > -1) {
    if (message.picked <= listener._dispatch.limit)
      result = true;
  }
  else {
    result = true;
  }
  return process.nextTick(function () {
    return callback(null, result);
  });
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
    return process.nextTick(function () {
      return callback(new Error('Failed to locate listener for message [' + compiled.id + ']'));
    });

  compiled.payload = params;
  joola.mongo.insert('messages', 'router', compiled, {}, function (err) {
    if (err) {
      console.log('Failed to push message', err, compiled);
      return process.nextTick(function () {
        return callback(err);
      });
    }
    joola.common.stats({event: 'events-request', events: 1});
    joola.logger.trace('Compiled request [' + compiled.id + '] for channel [' + channel + ']');
    dispatch.publisher.publish(channel + '-request', compiled.id);
    if (typeof callback === 'function') {
      listener[compiled.id] = callback;

      var message = {message: compiled, queue: "/queue/joola.dispatch." + compiled.channel.replace(':', '.'), msgId: compiled.id};
      dispatch.publishMessage(dispatch.stompClient, message, '/queue/joola.dispatch.' + compiled.channel.replace(':', '.'), null, true, callback);

    }
  });
};

dispatch.fulfill = function (message, result, headers, callback) {
  var self = dispatch;
  callback = callback || emptyfunc;

  message.fulfilled = 1;
  message['fulfilled-by'] = joola.UID;
  message['fulfilled-timestamp'] = new Date().getTime();
  message['fulfilled-timestamp-nice'] = new Date();
  message['fulfilled-duration'] = parseInt(message['fulfilled-timestamp']) - parseInt(message.timestamp);

  message.result = result;

  dispatch.publishMessage(dispatch.stompClient, message, headers['reply-to']);

  joola.mongo.update('messages', 'router', {id: message.id}, message, {}, function (err) {
    if (err) {
      return process.nextTick(function () {
        return callback(err);
      });
    }

    joola.common.stats({event: 'events-fulfilled', fulfilled: 1, fulfilledtime: message['fulfilled-duration']});
    joola.logger.trace('[dispatch] Fulfilled request [' + message.id + '] for channel [' + message.channel + ']');
    dispatch.publisher.publish(message.channel + '-done', message.id, callback);
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
          dispatch.removeListener(this._dispatch.message, this._dispatch.cb);
          return process.nextTick(function () {
            return callback.apply(this, arguments);
          });
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
    return process.nextTick(function () {
      return callback(new Error('Dispatch is not ready yet'));
    });
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