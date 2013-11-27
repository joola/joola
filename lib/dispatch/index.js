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

var dispatch = module.exports = function (options) {
  var self = dispatch;

  options = options || {};
  self.namespace = options.namespace || 'joola.io';
  self.host = options.host || 'localhost';
  self.port = options.port || 6379;
  self.db = options.db || 0;
  self.publisher = redis.createClient(options.port, options.host);
  self.subscriber = redis.createClient(options.port, options.host);

  //self.subscribed = false;
  self.channels = [];
  self.events = joola.events;

  self.stats = {
    events: {
      emit: 0,
      message: 0
    }
  };

  self.publisher.select(self.db);
  self.subscriber.select(self.db);

  if (options.auth) {
    self.publisher.auth(options.auth);
    self.subscriber.auth(options.auth);
  }

  self.publisher.on('connect', function () {
    joola.state.set('publisher', 'working', 'redis [publisher] is up.');
  });
  // Suppress errors from the Redis client
  self.publisher.on('error', function (err) {
    joola.state.set('publisher', 'failure', 'redis [publisher] is down: ' + err);
  });
  self.subscriber.on('connect', function () {
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

  return self;
};

dispatch.hook = function () {
  fs.readdirSync(__dirname).forEach(function (file) {
    return require('./' + file);
  });
};

dispatch.emitWait = function (namespace, message, details, callback) {
  var self = dispatch;
  var channel = namespace + ':' + message;

  joola.logger.silly('[emit] ' + channel);
  joola.redis.incr('stats:' + 'joola.io' + ':events:emit', function (err, value) {
    self.stats.events.emit = parseInt(value);
    return callback(null);
  });

  return self.publisher.publish(channel, JSON.stringify(details));
};

dispatch.emit = function (namespace, message, details, callback) {
  var self = dispatch;
  var channel = namespace + ':' + message;

  joola.logger.silly('[emit] ' + channel);
  if (typeof callback === 'function') {
    self.events.on(channel.replace('-request', '-done') + ':done', function (message) {
      self.events.removeAllListeners(channel.replace('-request', '-done') + ':done');
      var _err = null, _message = null;
      if (message.hasOwnProperty('err')) {
        _err = message.err;
        _message = message.message;
      }
      else {
        _message = message;
      }

      return callback(_err, _message);
    });
  }
  joola.redis.set('locks:channels:once:' + channel, 1, function (err, value) {
    joola.redis.incr('stats:' + 'joola.io' + ':events:emit', function (err, value) {
      self.stats.events.emit = parseInt(value);
    });

    return self.publisher.publish(channel, JSON.stringify(details));
  });
};

dispatch.on = function (namespace, message, callback) {
  var self = dispatch;
  var channel = namespace + ':' + message;

  if (self.channels.indexOf(channel) == -1) {
    joola.logger.silly('[on] subscribed to channel [' + channel + ']');
    self.subscriber.subscribe(channel);
    self.channels.push({key: uuid.v4(), channel: channel, cb: callback});
  }

  if (!self.subscribed) {
    self.subscribed = true;
    self.subscriber.on('message', function (channel, message) {
      joola.redis.incr('stats:' + 'joola.io' + ':events:message', function (err, value) {
        self.stats.events.message = parseInt(value);
      });
      message = JSON.parse(message);
      var _err = null, _message = null;
      if (message.hasOwnProperty('err')) {
        _err = message.err;
        _message = message.message;
      }
      else {
        _message = message;
      }

      joola.logger.silly('message [' + channel + ']');
      //check if once
      var _channel = _.find(self.channels, function (_channel) {
        return _channel.channel == channel;
      });

      if (_channel.once) {
        joola.redis.get('locks:channels:once:' + channel, function (err, value) {
          if (value) {
            joola.redis.incr('locks:channels:once:' + channel, function (err, value) {
              if (value == 2) {
                self.channels = _.without(self.channels, channel);
                joola.redis.expire('locks:channels:once:' + channel, 0);
                //self.events.emit(channel + ':done', {err: _err, message: _message});
                return _channel.cb(_err, _message);
              }
              else {
                joola.logger.silly('[on] ignored channel [' + channel + ']');
              }
            });
          }
          else {
            joola.logger.silly('[on] ignored channel [' + channel + ']');
          }
        });
      }
      else {
        return _channel.cb(_err, _message);
      }
      self.events.emit(channel + ':done', {err: _err, message: _message});
    });
  }
};

dispatch.once = function (namespace, message, callback) {
  var self = dispatch;
  var channel = namespace + ':' + message;

  if (self.channels.indexOf(channel) == -1) {
    joola.logger.silly('[on] subscribed once to channel [' + channel + ']');
    self.subscriber.subscribe(channel);
    self.channels.push({once: true, key: uuid.v4(), channel: channel, cb: callback});
  }
};
