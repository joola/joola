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
  fs = require('fs'),
  path = require('path'),
  redis = require('redis'),
  _ = require('underscore');

var dispatch = module.exports;

dispatch.init = function (callback) {
  var self = dispatch;

  self.namespace = 'dispatch2';
  self.host = joola.config.store.dispatch.redis.host || 'localhost';
  self.port = joola.config.store.dispatch.redis.port || 6379;
  self.db = joola.config.store.dispatch.redis.db || 0;
  self.publisher = redis.createClient(self.port, self.host);
  self.subscriber = redis.createClient(self.port, self.host);
  self.auth = joola.config.store.dispatch.redis.auth;

  self.subscribed = false;
  self.subscriptions = [];
  self.listeners = [];

  self.stats = {
    events: {
      emit: 0,
      message: 0
    }
  };

  self.publisher.select(self.db);
  self.subscriber.select(self.db);

  if (self.auth) {
    self.publisher.auth(self.auth);
    self.subscriber.auth(self.auth);
  }

  self.publisher.on('connect', function () {
    joola.logger.debug('[publisher] Connected to redis @ ' + self.host + ':' + self.port + '#' + self.db);
    joola.state.set('publisher', 'working', 'redis [publisher] is up.');
  });
  // Suppress errors from the Redis client
  self.publisher.on('error', function (err) {
    joola.state.set('publisher', 'failure', 'redis [publisher] is down: ' + err);
  });
  self.subscriber.on('connect', function () {
    joola.logger.debug('[subscriber] Connected to redis @ ' + self.host + ':' + self.port + '#' + self.db);
    joola.state.set('subscriber', 'working', 'redis [subscriber] is up.');
  });
  self.subscriber.on('error', function (err) {
    joola.state.set('subscriber', 'failure', 'redis [subscriber] is down: ' + err);
  });

  var lastEventCount = 0;
  setInterval(function () {
    var total = self.stats.events.emit + self.stats.events.message;
    var diff = total - lastEventCount;
    lastEventCount = total;
    //joola.logger.info('EPS: ' + diff);
  }, 1000);

  joola.events.emit('dispatch:ready');
  return callback(null);
};

dispatch.emit = function (channel, message, callback) {
  callback = callback || emptyfunc;
  joola.logger.silly('[dispatch] emit on: ' + channel);
  return dispatch.publisher.publish(channel, JSON.stringify(message), callback);
};

dispatch.emitWait = function (channel, message, callback) {
  callback = callback || emptyfunc;
  joola.logger.silly('[dispatch] emit and wait on: ' + channel);

  dispatch.once(channel.replace('-request', '-done'), callback);
  dispatch.publisher.publish(channel, JSON.stringify(message));
};

dispatch.on = function (channel, callback) {
  //subscribe only once
  if (dispatch.subscriptions.indexOf(channel) == -1) {
    joola.logger.silly('[dispatch] subscribed to: ' + channel);
    dispatch.subscriptions.push(channel);
    dispatch.subscriber.subscribe(channel);
  }
  //listen only once per channel and callback
  var exist = _.find(dispatch.listeners, function (listener) {
    return listener.channel == channel && listener.cb.toString() == callback.toString();
  });
  if (!exist) {
    joola.logger.silly('[dispatch] listen for: ' + channel);
    dispatch.listeners.push({channel: channel, cb: callback, once: false});

    if (!dispatch.subscribed) {
      dispatch.subscribed = true;
      dispatch.subscriber.on('message', function (channel, message) {
        joola.logger.silly('[dispatch] received message on channel: ' + channel);

        var _err = null;
        var _message = null;
        try {
          message = JSON.parse(message);
        }
        catch (ex) {
          //ignore
        }

        if (typeof message === 'object' && message.hasOwnProperty('err')) {
          _err = message.err;
          _message = message.message;
        }
        else if (typeof message === 'object' && message.hasOwnProperty('message'))
          _message = message.message;
        else
          _message = message;

        dispatch.listeners.forEach(function (listener) {
          if (listener.channel == channel) {
            if (listener.once && !listener.done) {
              listener.done = true;
              dispatch.removeListener(channel, listener.cb);
              joola.logger.silly('[dispatch] calling cb: ' + channel);
              return listener.cb(_err, _message);
            }
            else if (listener.once && listener.done) {
              dispatch.removeListener(channel, listener.cb);
            }
            else if (!listener.once) {
              joola.logger.silly('[dispatch] calling cb: ' + channel);
              return listener.cb(_err, _message);
            }
          }
        });
      });
    }
  }
};

dispatch.once = function (channel, callback) {
  //subscribe only once
  var exist;
  if (dispatch.subscriptions.indexOf(channel) == -1) {
    joola.logger.silly('[dispatch] subscribed once to: ' + channel);
    dispatch.subscriptions.push(channel);
    dispatch.subscriber.subscribe(channel);
  }
  else {
    exist = _.find(dispatch.listeners, function (listener) {
      return listener.channel == channel && listener.cb.toString() == callback.toString() && listener.once === true;
    });

    if (!exist) {
      joola.logger.silly('[dispatch] subscribed once to: ' + channel);
      dispatch.subscriptions.push(channel);
      dispatch.subscriber.subscribe(channel);
    }
  }
  //listen only once per channel and callback
  exist = _.find(dispatch.listeners, function (listener) {
    return listener.channel == channel && listener.cb.toString() == callback.toString() && listener.once === true;
  });
  if (!exist) {
    joola.logger.silly('[dispatch] listen once for: ' + channel);
    dispatch.listeners.push({channel: channel, cb: callback, once: true});
  }
};

dispatch.removeListener = function (channel, callback) {
  var _listeners = [];
  for (var i = 0; i < dispatch.listeners.length; i++) {
    var listener = dispatch.listeners[i];

    if (listener.channel == channel && listener.cb.toString() == callback.toString()) {
      joola.logger.silly('[dispatch] channel ' + channel + ' removed.');
    }
    else
      _listeners.push(listener);
  }
  dispatch.listeners = _listeners;
};

dispatch.removeAllListeners = function (channel) {
  var _listeners = [];
  for (var i = 0; i < dispatch.listeners.length; i++) {
    var listener = dispatch.listeners[i];
    if (listener.channel == channel) {

    }
    else
      _listeners.push(listener);
  }
  dispatch.listeners = _listeners;
};

dispatch.roundtrip = function (callback) {
  var uid = joola.common.uuid();

  dispatch.on('roundtrip-' + uid, function (message) {
    var delta = new Date().getTime() - parseInt(message);
    return callback(delta);
  });
  dispatch.publisher.publish('roundtrip-' + uid, new Date().getTime());
};

dispatch.hook = function () {
  fs.readdirSync(path.join(__dirname, './')).forEach(function (file) {
    if (file != 'index.js') {
      try {
        var module = require('./' + file);
        var modulename = file.replace('.js', '');
        dispatch[modulename] = {};
        Object.keys(module).forEach(function (fn) {
          var _fn = module[fn];
          _fn.dispatch();
          dispatch[modulename][fn] = _fn.run;
        });
      } catch (ex) {

      }
    }
  });
};