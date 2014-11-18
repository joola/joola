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
  cluster = require('cluster'),
  usage = require('usage'),
  os = require('os');

//check for any event loop block
function watch_eventloop() {
  var lastTime = new Date().getTime();
  setInterval(function () {
    var delta = new Date().getTime() - lastTime;
    if (delta > 1500) {
      joola.stats.emit({event: 'eventlooplocks', eventlooplocks: 1});
      joola.logger.warn('Blocked event-loop, ' + delta.toString() + 'ms, since: ' + new Date(lastTime).format('hh:nn:ss.fff'));
      joola.events.emit('elb', delta);
    }
    lastTime = new Date().getTime();
  }, 1000);
}

function watch_state() {
  var lastStatus = 'failure';
  joola.dispatch.on('nodes:state:change', function (channel, message) {
    if (message[0] != joola.UID) {
      joola.logger.info('Detected node [' + message[0] + '] has changed state to [' + message[1].status + ']');
    }
    else {
      var status = message[1].status;
      if (status === 'online')
        joola.logger.debug('State changed to [' + message[1].status + ']');
      else
        joola.logger.info('State changed to [' + message[1].status + ']');
    }
    //remove it from node list
    if (message[1].status != 'working' && message[1].status != 'online')
      if (joola.redis)
        joola.redis.del('nodes:' + message[0]);
      else
        joola.memory.set('nodes:' + message[0], null);
  });

  setInterval(function () {
    var status = joola.state.get().status;
    if (status != lastStatus) {
      joola.logger.debug('Status change, joola is now [' + status + ']');
      lastStatus = status;
      joola.state.emit('state:change', status);
      joola.dispatch.emit('nodes:state:change', [joola.UID, joola.state.get()]);
    }
  }, 1000);
}

function node_ping() {
  var key = 'nodes:' + joola.UID;
  var ping = function () {
    var node = joola.nodeState();
    if (joola.redis) {
      joola.redis.hmset(key, node, function (err) {
        joola.redis.expire(key, 6);
      });
    }
    else
      joola.memory.set(key, node, 6000);
  };

  joola.state.on('state:change', ping);
  setInterval(function () {
    ping();
  }, 1000);
}

function watch_usage() {
  var pid = process.pid;
  var options = { keepHistory: true };
  setInterval(function () {
    usage.lookup(pid, options, function (err, result) {
      if (err)
        return;
      result.cpuInfo.cpuTime = result.cpuInfo.cpuTime || null;
      joola.stats.emit(joola.common.extend({event: 'nodeusage'}, result));
    });
  }, 60000);
}

joola.events.on('datastore:ready', function () {
  watch_eventloop();
  node_ping();
  watch_state();
  watch_usage();
});
