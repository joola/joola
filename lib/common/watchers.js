/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

var usage = require('usage');

//check for any event loop block
function watch_eventloop() {
  var lastTime = new Date().getTime();
  setInterval(function () {
    var delta = new Date().getTime() - lastTime;
    if (delta > 1000) {
      joola.stats.set('eventlooplocks', {
        eventlooplocks$sum: 1
      });
      joola.logger.warn('Blocked event-loop, ' + delta.toString() + 'ms');
    }
    lastTime = new Date().getTime();
  }, 50);
}

function watch_state() {
  var lastStatus = 'failure';

  joola.dispatch.on('nodes:state:change', function (channel, message) {
    if (message[0] != joola.UID)
      joola.logger.info('Detected node [' + message[0] + '] has changed state to [' + message[1].status + ']');
    else
      joola.logger.info('State changed to [' + message[1].status + ']');
  });

  setInterval(function () {
    var status = joola.state.get().status;
    if (status != lastStatus) {
      joola.logger.debug('Status change, joola.io is now [' + status + ']');
      lastStatus = status;
      joola.state.emit('state:change', status);
      joola.dispatch.emit('nodes:state:change', [joola.UID, joola.state.get()]);
    }
  }, 500);
}

function node_ping() {
  var ping = function () {
    var state = joola.state.get();
    var status = state.status;
    var key = 'nodes:' + joola.UID;
    joola.redis.hset(key, 'uid', joola.UID);
    joola.redis.hset(key, 'state', status);
    joola.redis.hset(key, 'uptime', process.uptime());

    joola.redis.expire(key, 6);
  };

  joola.state.on('state:change', ping);

  setInterval(function () {
    ping();
  }, 5000);
}

function watch_usage() {
  var pid = process.pid;
  var options = { keepHistory: true };
//drop the first one
  usage.lookup(pid, options, function (err, result) {
    setInterval(function () {
      usage.lookup(pid, options, function (err, result) {
        joola.stats.set('usage', {
          cpu$sum: result.cpu,
          mem$sum: result.memory
        });
      });
    }, 1000);
  });
}

joola.events.on('dispatch:ready', function () {
  watch_usage();
  watch_eventloop();
  watch_state();
  node_ping();
});
