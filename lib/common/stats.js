/**
 *  @title joola.io/lib/common/stats
 *  @overview Provides system usage statistics for the management portal
 *  @description
 *  The `stats` object emits stats taken from redis regarding the usage of the joola.io framework.
 *
 * - [statsEvents](#statsEvents)
 * - [incr](#incr)
 *
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/


var
  async = require('async'),
  EventEmitter2 = require('eventemitter2').EventEmitter2;

var twix = require('twix');
var moment = require('moment');


var stats = new EventEmitter2({wildcard: true, newListener: true});
stats._id = 'stats';

module.exports = exports = stats;

stats.emitInterval = 2500; //1 second
stats.ttl = 1000 * 60 * 60; //1 hour
/**
 * Lists all stat events from redis
 *
 * Configuration elements participating: `config:datasources`.
 *
 * Events raised via `stats`: `stats:events`
 *
 * ```js
 * joola.stats.statsEvents();
 * ```
 */
stats.statsEvents = function () {
  joola.redis.keys('stats:events:*', function (err, keys) {
    var jsonstats = {};

    var startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 60);
    var endDate = new Date();

    var calls = [];
    var itr = moment.twix(startDate, endDate).iterate("minutes");
    var range = [];
    while (itr.hasNext()) {
      var value = itr.next()._d;
      range.push([value.getTime(), null]);
    }

    if (keys) {
      keys.forEach(function (val) {
        var call = function (callback) {
          var _range = range.clone();
          joola.redis.hgetall(val, function (err, res) {
            var lastKey = null;
            var itemCount = 0;
            for (var key in res) {
              var roundedMinute = new Date(new Date(parseInt(key)));
              roundedMinute.setSeconds(0);
              roundedMinute.setMilliseconds(0);
              var tskey = roundedMinute.getTime();
              if (tskey != lastKey) {
                itemCount = 1;
                lastKey = tskey;
              }
              else
                itemCount++;

              for (var i = 0; i < _range.length; i++) {
                var rangeItem = _range[i];
                var timestamp = rangeItem[0];
                if (timestamp == tskey) {
                  _range[i] = [tskey, (parseFloat(res[key]) + (rangeItem[1] ? rangeItem[1] : 0)) / 2];
                  break;
                }
              }
            }

            jsonstats[val] = _range;
            return callback(err);
          });
        };
        calls.push(call);
      });
      async.parallel(calls, function (err) {
        if (err) {
          joola.logger.warn(err);
          return;
        }
        if (joola.io && joola.io.sockets) {
          joola.io.sockets.emit('stats:events', jsonstats);
        }
        joola.events.emit('stats:events', jsonstats);
      });
    }
  });

  setTimeout(stats.statsEvents, stats.emitInterval);
};

/**
 * Increments a redis stats key
 * @param {String} [key] The key that will be incremented
 * @param {Function} [callback] called following execution with results.
 *
 * ```js
 * joola.stats.incr(key, function(value) {
 *  console.log(value);
 * });
 * ```
 */
stats.incr = function (key, incr, callback) {
  callback = callback || emptyfunc;

  var ts = new Date().getTime();
  joola.redis.hincr('stats:events:' + key, ts, incr, function (err, value) {
    joola.redis.expire('stats:events:' + key, stats.ttl, function (err) {
      return callback(err, value);
    });
  });
};

stats.incrby = function (key, incrby, callback) {
  callback = callback || emptyfunc;

  var ts = new Date().getTime();
  joola.redis.hincrby('stats:events:' + key, ts, incrby, function (err, value) {
    joola.redis.expire('stats:events:' + key, stats.ttl, function (err) {
      return callback(err, value);
    });
  });
};

stats.set = function (key, value, callback) {
  callback = callback || emptyfunc;

  var ts = new Date().getTime();
  joola.redis.hmset('stats:events:' + key, ts, value, function (err, value) {
    joola.redis.expire('stats:events:' + key, stats.ttl, function (err) {
      return callback(err, value);
    });
  });
};

setTimeout(stats.statsEvents, stats.emitInterval);
