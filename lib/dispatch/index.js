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
  _ = require('underscore'),

  streamify = require('json-streamify').streamify;

var json = require('json-streams');

var dispatch = module.exports;

dispatch.compose = function (channel, payload, callback) {
  var self = dispatch;
  var compiled = {
    id: joola.common.uuid(),
    timstamp: new Date().getTime(),
    'timestamp-nice': new Date(),
    from: joola.UID,
    to: 'any',
    picked: 0,
    fullfilled: 0,
    'fullfilled-by': null,
    'fullfilled-timestamp': null,
    channel: channel
  };

  joola.common.stringify(payload, function (err, stringPayload) {
    compiled.payload = stringPayload;
    var key = 'messages:' + compiled.id;
    self.redis.hmset(key, compiled, function (err) {
      if (err)
        return callback(err);

      return callback(null, compiled);
    });
  });
};

dispatch.init = function (callback) {
  try {
    var self = dispatch;

    self.namespace = 'dispatch2';
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

    self.stats = {
      events: {
        emit: 0,
        message: 0
      }
    };

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

    var lastEventCount = 0;
    setInterval(function () {
      var total = self.stats.events.emit + self.stats.events.message;
      var diff = total - lastEventCount;
      lastEventCount = total;
      //joola.logger.info('EPS: ' + diff);
    }, 1000);

    joola.events.emit('dispatch:ready');
    return callback(null);
  }
  catch (ex) {
    console.log(ex);
    return callback(ex);
  }
};

dispatch.emit = function (channel, message, callback) {
  callback = callback || emptyfunc;
  joola.logger.silly('[dispatch] emit on: ' + channel);

  joola.stats.set('events', {events$sum: 1});
  joola.stats.set('events-emits', {events$sum: 1});

  dispatch.compose(channel, message, function (err, compiledMessage) {
    if (err)
      console.log(err);

    //console.log(compiledMessage);
    dispatch.publisher.publish(channel, compiledMessage.id, callback);
  });
};

dispatch.emitWait = function (channel, message, callback) {
  callback = callback || emptyfunc;
  joola.logger.silly('[dispatch] emit and wait on1: ' + channel);

  joola.stats.set('events', {events$sum: 1});
  joola.stats.set('events-emitwait', {events$sum: 1});

  dispatch.once(channel.replace('-request', '-done'), callback);
  dispatch.compose(channel, message, function (err, compiledMessage) {
    if (err)
      console.log(err);

    //console.log(compiledMessage);
    dispatch.publisher.publish(channel, compiledMessage.id);
    //dispatch.publisher.publish(channel, JSON.stringify(message));
  });
};

dispatch.request = function (channel, message, callback) {
  callback = callback || emptyfunc;
  joola.logger.silly('[dispatch] request for: ' + channel + ' ['+message.id+']');

  dispatch.once(channel.replace('-request', '-done'), callback);
  dispatch.compose(channel, message, function (err, compiledMessage) {
    if (err)
      console.log(err);

    dispatch.publisher.publish(channel, compiledMessage.id);
  });
};

dispatch.fullfil = function (message, payload, callback) {
  callback = callback || emptyfunc;
  joola.logger.silly('[dispatch] fullfilled: ' + message.channel + ' ['+message.id+']');

  dispatch.once(channel.replace('-request', '-done'), callback);
  dispatch.compose(channel, message, function (err, compiledMessage) {
    if (err)
      console.log(err);

    //console.log(compiledMessage);
    dispatch.publisher.publish(channel, compiledMessage.id);
    //dispatch.publisher.publish(channel, JSON.stringify(message));
  });
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
        joola.logger.silly('[dispatch] received message on channel: ' + channel + ', with id: ' + message);

        joola.stats.set('events', {events$sum: 1});
        joola.stats.set('events-on', {events$sum: 1});

        dispatch.redis.hgetall('messages:' + message, function (err, value) {
          //console.log(err, value);
          if (err)
            return callback(err);
          if (!value)
            return callback(new Error('Failed to locate message id: ' + message));

          var payload = value.payload;
          joola.common.parse(payload, function (err, parsePayload) {
            payload = parsePayload;
            var _err, _message;
            if (typeof payload === 'object' && payload.hasOwnProperty('err')) {
              _err = payload.err;
              _message = payload.message || '';
            }
            else if (typeof payload === 'object' && payload.hasOwnProperty('message'))
              _message = payload.message || '';
            else
              _message = payload;

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

  var channel = 'roundtrip-' + uid;
  dispatch.emitWait(channel, {payload: null, timestamp: new Date().getTime()}, function (err, message) {
    if (err)
      return callback(err);

    var delta = new Date().getTime() - parseInt(message.timestamp);
    return callback(null, delta);
  });
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
