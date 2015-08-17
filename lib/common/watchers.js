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
  os = require('os');

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
      /* istanbul ignore else */
      if (joola.redis)
        joola.redis.del(joola.config.namespace + ':nodes:' + message[0]);
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
  var key = joola.config.namespace + ':nodes:' + joola.UID;
  var ping = function () {
    var node = joola.nodeState();
    /* istanbul ignore else */
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

function watch_eps() {
  var template = {
    eps: 0,
    current: 0,
    total: 0
  };
  joola.events.on('event_start', function () {
    joola.statistics = joola.statistics || template;
    joola.statistics.current++;
    joola.statistics.total++;
  });
  joola.events.on('event_end', function () {
    joola.statistics = joola.statistics || template;
    joola.statistics.current--;
  });
}

joola.events.on('datastore:ready', function () {
  node_ping();
  watch_state();
});

watch_eps();