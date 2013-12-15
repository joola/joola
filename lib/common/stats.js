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

    var startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 1);
    var endDate = new Date();


    var calls = [];
    if (keys) {
      keys.forEach(function (val) {
        var call = function (callback) {
          joola.redis.hgetall(val, function (err, res) {
            var itr = moment.twix(startDate, endDate).iterate("seconds");
            var range = [];
            while (itr.hasNext()) {
              range.push([itr.next().format('X'), null]);
            }
            for (var key in res) {
              if (res.hasOwnProperty(key)) {
                var tskey = (new Date(parseInt(key)).setMilliseconds(0) / 1000).toString();
                for (var i = 0; i < range.length; i++) {
                  var rangeItem = range[i];
                  var timestamp = rangeItem[0];
                  if (timestamp == tskey) {
                    if (range[i] == [tskey, null])
                      range[i] = [tskey, res[key]];
                    else
                      range[i] = [tskey, parseInt(res[key]) + 1];

                  }
                }
              }
            }
            jsonstats[val] = range;
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
stats.incr = function (key, options, callback) {
  var incrby;
  if (options && options.incrby)
    incrby = options.incrby;
  else
    incrby = 1;

  callback = callback || emptyfunc;

  var ts = new Date().getTime();
  joola.redis.hmset('stats:events:' + key, ts, 0, function () {

    joola.redis.hincrby('stats:events:' + key, ts, incrby, function (err, value) {
      return callback(err, value);
    });

  });
};

stats.incr('upstarts', function (err, val) {
  //console.log(err, val);
});

setTimeout(stats.statsEvents, stats.emitInterval);

function getInterval() {
//The interval in ms
  return Math.floor(Math.random() * 300) + 1;
}
function getValue() {
//The value to push
  return Math.floor(Math.random() * 100) + 0;
}
function run(key) {
  var val = getValue();
  joola.stats.incr(key, {incrby: val});
  //setTimeout(run(key), getInterval());
}
setInterval(function () {
  run('dummy:counter');
}, getInterval());
setInterval(function () {
  run('dummy2:counter');
}, getInterval());
setInterval(function () {
  run('dummy3:counter');
}, getInterval());
setInterval(function () {
  run('dummy4:counter');
}, getInterval());

