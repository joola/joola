/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

var
  redis = require('redis'),
  uuid = require('node-uuid');

var dispatch = module.exports = function (options) {
  var self = this;

  options = options || {};
  this.namespace = options.namespace || 'joola.io';
  this.host = options.host || 'localhost';
  this.port = options.port || 6379;
  this.db = options.db || 0;
  this.publisher = redis.createClient(options.port, options.host);
  this.subscriber = redis.createClient(options.port, options.host);

  //this.subscribed = false;
  this.channels = [];
  this.events = joola.events;

  this.stats = {
    events: {
      emit: 0,
      message: 0
    }
  };

  this.publisher.select(this.db);
  this.subscriber.select(this.db);

  if (options.auth) {
    this.publisher.auth(options.auth);
    this.subscriber.auth(options.auth);
  }

  // Suppress errors from the Redis client
  this.publisher.on('error', function (err) {
    console.dir(err);
  });
  this.subscriber.on('error', function (err) {
    console.dir(err);
  });

  var lastEventCount = 0;
  setInterval(function () {
    var total = self.stats.events.emit + self.stats.events.message;
    var diff = total - lastEventCount;
    lastEventCount = total;
    //joola.logger.info('EPS: ' + diff);
  }, 1000);

  return this;
};

dispatch.emit = function (namespace, message, details, callback) {
  var self = this;
  var channel = namespace + ':' + message;

  joola.logger.debug('[emit] ' + channel);
  if (typeof callback === 'function') {
    this.events.on(channel.replace('-request', '-done') + ':done', function (message) {
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
    joola.redis.incr('stats:' + __name + ':events:emit', function (err, value) {
      self.stats.events.emit = parseInt(value);
    });

    return self.publisher.publish(channel, JSON.stringify(details));
  });
};

dispatch.on = function (namespace, message, callback) {
  var self = this;
  var channel = namespace + ':' + message;

  if (this.channels.indexOf(channel) == -1) {
    joola.logger.debug('[on] subscribed to channel [' + channel + ']');
    this.subscriber.subscribe(channel);
    this.channels.push({key: uuid.v4(), channel: channel, cb: callback});
  }

  if (!this.subscribed) {
    this.subscribed = true;
    this.subscriber.on('message', function (channel, message) {
      joola.redis.incr('stats:' + __name + ':events:message', function (err, value) {
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

      joola.logger.debug('message [' + channel + ']');
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
                joola.logger.debug('[on] ignored channel [' + channel + ']');
              }
            });
          }
          else {
            joola.logger.debug('[on] ignored channel [' + channel + ']');
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
  var channel = namespace + ':' + message;

  if (this.channels.indexOf(channel) == -1) {
    joola.logger.debug('[on] subscribed once to channel [' + channel + ']');
    this.subscriber.subscribe(channel);
    this.channels.push({once: true, key: uuid.v4(), channel: channel, cb: callback});
  }
};