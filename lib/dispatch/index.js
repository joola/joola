/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  joola = require('../joola'),

  events = require('events'),
  domain = require('domain'),
  url = require('url'),
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

    self.subscribed = false;
    self.subscriptions = [];
    self.listeners = [];
    self.tracers = [];
    self.initialized = false;
    self.events = new events.EventEmitter();
    self.enabled = joola.config.get('dispatch:enabled');
    /* istanbul ignore if */
    if (typeof self.enabled === 'undefined')
      self.enabled = true;

    var redisConfig = joola.config.get('store:dispatch:redis');
    if (self.enabled && redisConfig && redisConfig.dsn) {
      var redisdsn = redisConfig.dsn;
      var parsed_url = url.parse(redisdsn);
      var parsed_auth = (parsed_url.auth || '').split(':');

      self.host = parsed_url.host.split(':')[0];
      self.port = parsed_url.port || 6379;
      self.db = parsed_auth[0];
      self.auth = parsed_auth[1];

      self.redis = redis.createClient(self.port, self.host);
      self.publisher = redis.createClient(self.port, self.host);
      self.subscriber = redis.createClient(self.port, self.host);

      self.redis.select(self.db);
      self.publisher.select(self.db);
      self.subscriber.select(self.db);

      /* istanbul ignore if */
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
      /* istanbul ignore next */
      self.publisher.on('error', function (err) {
        joola.state.set('publisher', 'failure', 'redis [publisher] is down: ' + (typeof(err) === 'object' ? err.message : err));
      });
      self.subscriber.on('connect', function () {
        joola.logger.debug('[subscriber] Connected to redis @ ' + self.host + ':' + self.port + '#' + self.db);
        joola.state.set('subscriber', 'working', 'redis [subscriber] is up.');
      });
      /* istanbul ignore next */
      self.subscriber.on('error', function (err) {
        joola.state.set('subscriber', 'failure', 'redis [subscriber] is down: ' + (typeof(err) === 'object' ? err.message : err));
      });
      /* istanbul ignore next */
      self.redis.on('error', function (err) {
        joola.state.set('publisher', 'failure', 'redis [publisher] is down: ' + (typeof(err) === 'object' ? err.message : err));
        joola.state.set('subscriber', 'failure', 'redis [subscriber] is down: ' + (typeof(err) === 'object' ? err.message : err));
      });
    }
    else {
      self.enabled = false;
      self.subscriber = new events.EventEmitter();
      self.publisher = new events.EventEmitter();
    }
    dispatch.subscriber.on('message', function (channel, message) {
      var listeners;
      listeners = _.filter(dispatch.listeners, function (l) {
        return l._dispatch.message == channel.replace('-request', '').replace('-done', '');
      });
      listeners.forEach(function (listener) {
        joola.common.parse(message, function (err, message) {
          return process.nextTick(function () {
            return listener._dispatch.cb.call(listener, channel, message);
          });
        });
      });
    });

    var stompSettings = {
      debug: false
    };
    var stompConfig = joola.config.get('store:dispatch:stomp');
    if (self.enabled && stompConfig && stompConfig.dsn) {
      var stompdsn = stompConfig.dsn;
      var parts = url.parse(stompdsn);
      stompSettings.host = parts.host.split(':')[0];
      stompSettings.port = parseInt(parts.port || 61613, 10);
      stompSettings.user = parts.auth.split(':')[0];
      stompSettings.password = parts.auth.split(':')[1];
      stompSettings.vhost = (parts.path ? parts.path.replace('/', '') : null);

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

      var reconnectTimer;

      var stompReconnectInterval = 1000;
      var stompConnect = function () {
        var stompArgs = {
          host: stompSettings.host,
          port: stompSettings.port,
          login: stompSettings.user,
          passcode: stompSettings.password,
          vhost: stompSettings.vhost,
          debug: stompSettings.debug,
          timeout: -1
        };

        try {
          joola.logger.debug('STOMP connecting to ' + stompSettings.host + ':' + stompSettings.port + '@' + stompSettings.vhost);
          dispatch.stompClient = new Stomp().Client(stompArgs);
          var connected = false;
          dispatch.stompClient.on('connected', function () {
            self.initialized = true;
            /* istanbul ignore if */
            if (reconnectTimer) {
              clearInterval(reconnectTimer);
              reconnectTimer = null;
            }
            joola.logger.debug('STOMP connected @ ' + stompSettings.host + ':' + stompSettings.port);
            dispatch.hook();
            joola.state.set('dispatch', 'working', 'dispatch is up.');
            /* istanbul ignore if */
            if (!connected) {
              connected = true;
              joola.events.emit('dispatch:ready');
              return process.nextTick(function () {
                return callback(null);
              });
            }
          });
        }
        catch (ex) {
          /* istanbul ignore next */
          joola.state.set('dispatch', 'failure', 'dispatch is down: ' + ex);
        }

        /* istanbul ignore next */
        dispatch.stompClient.on('disconnected', function (reason) {
          joola.logger.debug('STOMP disconnect, ' + (reason || 'no reason specified.'));
          if (!reconnectTimer) {
            reconnectTimer = setInterval(function () {
              joola.logger.debug('Attempting reconnect to STOMP');
              dispatch.stompClient.connect();
            }, stompReconnectInterval);
            stompReconnectInterval = stompReconnectInterval * 2;
          }
        });

        /*
         dispatch.stompClient.on('receipt', function (receipt) {

         });
         */

        /* istanbul ignore next */
        dispatch.stompClient.on('closed', function (reason) {
          joola.logger.debug('STOMP closed: ' + reason);
          //if STOMP fails on initialization this is where it's caught.
          if (!self.initialized)
            return callback(new Error('STOMP Closed: ' + reason));
        });

        /* istanbul ignore next */
        dispatch.stompClient.on('error', function (errorFrame) {
          if (reconnectTimer) {
            joola.logger.error('STOMP error: ' + errorFrame);
            joola.state.set('dispatch', 'failure', 'dispatch is down: ' + errorFrame);
            try {
              dispatch.stompClient.disconnect();
            }
            catch (ex) {
              //ignore
            }
          }
        });

        /* istanbul ignore next */
        dispatch.stompClient.on('SIGINT', function () {
          joola.logger.error('STOMP SIGINT');
          joola.state.set('dispatch', 'failure', 'dispatch is down: SIGINT');
          try {
            dispatch.stompClient.disconnect();
          }
          catch (ex) {
            //ignore
          }
        });

        dispatch.stompClient.connect();
      };
      stompConnect();
    }
    else {
      self.enabled = false;
      dispatch.hook();
      joola.state.set('dispatch', 'working', 'dispatch is up.');
      joola.events.emit('dispatch:ready');
      return process.nextTick(function () {
        return callback(null);
      });
    }
  }
  catch (ex) {
    /* istanbul ignore next */
    console.log(ex);
    /* istanbul ignore next */
    return process.nextTick(function () {
      return callback(ex);
    });
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
        /* istanbul ignore next */
        console.log('Failure in loading dispatch module [' + file + ']: ' + ex);
        /* istanbul ignore next */
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
    //joola.logger.trace('[dispatch] Channel [' + details.message + '] already registered.');
  }
  else {
    fn._dispatch = fn._dispatch || {};
    fn._dispatch.criteria = fn._dispatch.criteria || 'notme';
    fn._dispatch.limit = fn._dispatch.limit || 1;

    dispatch.listeners.push(fn);
    if (!details.message)
      return callback(null);
  }
  if (dispatch.enabled && details.message) {
    dispatch.listen(dispatch.stompClient, '/queue/joola.dispatch.' + details.message.replace(':', '.'), "", function name(message, headers) {
      dispatch.processRequest(message, headers);
    });
    dispatch.listen(dispatch.stompClient, '/temp-queue/joola.dispatch.' + details.message.replace(':', '.') + '.done', "", function name(message, headers) {
      dispatch.processResponse(message, headers);
    });
  }

  return process.nextTick(function () {
    return callback(null);
  });
};
var first = false;

dispatch.processRequest = function (message, headers) {
  message = message[0];
  message = JSON.parse(message).message;

  var _result;
  joola.auth.getUserByToken(message.token, function (err, user) {
    /* istanbul ignore if */
    if (err) {
      dispatch.fulfill(message, {
        err: err,
        message: null
      }, headers);
    }
    var context = {};
    context.user = user;

    var payload = message.payload;
    var _params = [];
    _params.push(context);

    /* istanbul ignore else */
    if (payload && typeof payload === 'object') {
      Object.keys(payload).forEach(function (key) {
        _params.push(payload[key]);
      });
    }
    else if (message.payload && message.payload != '{}') {
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
        var d = domain.create();
        /* istanbul ignore next */
        d.on('error', function (err) {
          joola.logger.warn(err, 'Failed to process dispatch request: ' + err);
          _result = {
            err: err,
            message: null
          };
          dispatch.fulfill(message, _result, headers);
        });
        d.run(function () {
          listener.run.apply(message, _params);
        });
      });
    }
    catch (ex) {
      /* istanbul ignore next */
      dispatch.fulfill(message, {
        err: ex,
        message: null
      }, headers);
    }
  });
};

dispatch.processResponse = function (message, headers) {
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
      /* istanbul ignore else */
      if (joola.common.typeof(result.message) === 'object') {
        Object.keys(result.message).forEach(function (key) {
          args.push(result.message[key]);
        });
      }
      else if (joola.common.typeof(result.err) === 'object') {
        joola.logger.debug(result.err, 'Failed to process dispatch response: ' + result.err);
        args.push(result.err);
      }
      else {
        console.log('Weird result', message);
      }

      delete message.result;
      delete message.payload;
      args.push(message);
      args.push(headers);

      if (listener[message.id]) {
        var d = domain.create();
        /* istanbul ignore next */
        d.on('error', function (err) {
          joola.logger.warn(err, 'Failed to process dispatch response: ' + err);
          //TODO: The assumption here is that the same function that was called and failed will handle the error properly. this is a risky assumption, but it allows for proper error messages to be handled.
          try {
            listener[message.id].apply(listener, [err]);
          }
          catch (ex) {
            //there's nothing we can do at this point. the request will timeout and die.
          }
        });
        d.run(function () {
          listener[message.id].apply(listener, args);
          delete listener[message.id];
        });
      }
    }
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

  /* istanbul ignore if */
  if (!listener)
    return process.nextTick(function () {
      return callback(new Error('Failed to locate listener for message [' + compiled.id + ']'));
    });

  compiled.payload = params;
  joola.logger.trace('Compiled request [' + compiled.id + '] for channel [' + channel + ']');
  if (typeof callback === 'function') {
    listener[compiled.id] = callback;

    var message = {
      message: compiled,
      queue: "/queue/joola.dispatch." + compiled.channel.replace(':', '.'),
      msgId: compiled.id
    };
    dispatch.publishMessage(dispatch.stompClient, message, '/queue/joola.dispatch.' + compiled.channel.replace(':', '.'), null, true);
  }
};

dispatch.fulfill = function (message, result, headers, callback) {
  var self = dispatch;
  callback = callback || function () {
  };

  message.fulfilled = 1;
  message['fulfilled-by'] = joola.UID;
  message['fulfilled-timestamp'] = new Date().getTime();
  message['fulfilled-timestamp-nice'] = new Date();
  message['fulfilled-duration'] = parseInt(message['fulfilled-timestamp']) - parseInt(message.timestamp);

  message.result = result;

  dispatch.publishMessage(dispatch.stompClient, message, headers['reply-to']);
  joola.logger.trace('[dispatch] Fulfilled request [' + message.id + '] for channel [' + message.channel + ']');
};

dispatch.on = function (channel, callback, next) {
  callback = callback || function () {
  };
  var exists = _.find(dispatch.listeners, function (listener) {
    return listener._dispatch.message == channel && (listener._dispatch.cb ? listener._dispatch.cb.toString() : null) == (callback ? callback.toString() : null);
  });
  /* istanbul ignore else */
  if (!exists) {
    joola.logger.trace('[dispatch] listen on: ' + channel);
    var listener = {
      _dispatch: {
        message: channel,
        cb: callback
      }
    };
    dispatch.listeners.push(listener);
    /* istanbul ignore else */
    if (dispatch.enabled) {
      dispatch.subscriber.subscribe(channel, next);
      return listener;
    }
    else {
      dispatch.events.on(channel, function (message) {
        var found = _.find(dispatch.listeners, function (listener) {
          return listener._dispatch.message === channel;
        });
        if (found)
          found._dispatch.cb.apply(this, [channel, message]);
      });
      if (typeof next === 'function')
        return next(null);
      else
        return listener;
    }
  }
  else {
    callback(new Error('listener on this channel already assigned with the same callback.'));
    return null;
  }
};

dispatch.once = function (channel, callback, next) {
  callback = callback || function () {
  };

  var exists = _.find(dispatch.listeners, function (listener) {
    return listener._dispatch.message == channel && (listener._dispatch.cb ? listener._dispatch.cb.toString() : null) == (callback ? callback.toString() : null);
  });
  if (!exists) {
    joola.logger.trace('[dispatch] listen on: ' + channel);
    var listener = {
      _dispatch: {
        message: channel,
        replies: 0,
        cb: function () {
          ++this._dispatch.replies;
          if (this._dispatch.replies > 1)
            return;

          dispatch.removeListener(this._dispatch.message, this._dispatch.cb);
          return process.nextTick(function () {
            return callback.apply(this, arguments);
          });
        }
      }
    };
    dispatch.listeners.push(listener);
    if (dispatch.enabled)
      dispatch.subscriber.subscribe(channel, next);
    else {
      dispatch.events.once(channel, callback);
      if (typeof next === 'function')
        return next(null);
      else
        return null;

    }

    return listener;
  }
  else {
    callback(new Error('listener on this channel already assigned with the same callback.'));
    return null;
  }
};

dispatch.emit = function (channel, message, callback) {
  callback = callback || function () {
  };
  dispatch.events.emit(channel, message);
  /* istanbul ignore else */
  if (dispatch.publisher) {
    /* istanbul ignore else */
    if (dispatch.enabled) {
      dispatch.publisher.publish(channel, JSON.stringify(message), callback);
    }
    else
      return callback(null);
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
