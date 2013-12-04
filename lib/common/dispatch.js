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
  redis = require('redis'),
  uuid = require('node-uuid'),
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


  return callback(null);
};

dispatch.emit = function (channel, message, callback) {
  callback = callback || emptyfunc;
  joola.logger.silly('[dispatch] emit on: ' + channel);
  return dispatch.publisher.publish(channel, JSON.stringify(message), callback);
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
    dispatch.listeners.push({channel: channel, cb: callback});

    if (!dispatch.subscribed) {
      dispatch.subscribed = true;
      dispatch.subscriber.on('message', function (channel, message) {
        joola.logger.silly('[dispatch] received message on channel: ' + channel);
        dispatch.listeners.forEach(function (listener) {
          if (listener.channel == channel) {
            joola.logger.silly('[dispatch] calling cb: ' + channel);
            listener.cb(message);
          }
        });
      });
    }
  }
};

dispatch.removeListener = function (channel, callback) {
  var _listeners = [];
  for (var i = 0; i < dispatch.listeners.length; i++) {
    var listener = dispatch.listeners[i];
    if (listener.channel == channel && listener.cb.toString() == callback.toString()) {

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
  var uid = uuid.v4();
  var bench = require('./benchmark');
  var payload = bench.setup();

  dispatch.on('roundtrip-' + uid, function (message) {
    var delta = new Date().getTime() - parseInt(message);
    return callback(delta);
  });
  dispatch.publisher.publish('roundtrip-' + uid, new Date().getTime());
};