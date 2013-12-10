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

var stats = new EventEmitter2({wildcard: true, newListener: true});
stats._id = 'stats';

module.exports = exports = stats;

stats.emitInterval = 1000;

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

    var calls = [];
    keys.forEach(function (val) {
      var call = function (callback) {
        joola.redis.get(val, function (err, res) {
          var keysplit = val.split(":");
          if (!jsonstats[keysplit[1]])
            jsonstats[keysplit[1]] = {};
          jsonstats[keysplit[1]][keysplit[2]] = res;
          return callback(err);
        })
      };
      calls.push(call);
    });
    async.parallel(calls, function (err) {
      if (err) {
        //do something
        return;
      }
      if (joola.io && joola.io.sockets)
        joola.io.sockets.emit('stats:events', jsonstats);
      joola.events.emit('stats:events', jsonstats);
    });
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
stats.incr = function (key, callback) {
  callback = callback || emptyfunc;
  joola.redis.incr('stats:events:' + key, function (err, value) {
    joola.redis.incr('stats:events', function () {
    });
    return callback(err, value);
  });
};

setTimeout(stats.statsEvents, stats.emitInterval);