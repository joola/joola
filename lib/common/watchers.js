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
  usage = require('usage'),
  cluster = require('cluster'),
  os = require("os");

//check for any event loop block
function watch_eventloop() {
  var lastTime = new Date().getTime();
  setInterval(function () {
    var delta = new Date().getTime() - lastTime;
    if (delta > 100) {
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
  var key = 'nodes:' + joola.UID;

  var hostname = os.hostname();
  var isCluster = false; //Object.keys(cluster.workers).length > 0;
  var clusterID = null;// = cluster.worker ? cluster.worker.id : null;
  var isMaster = null;// = Object.keys(cluster.workers).length > 0 ? cluster.isMaster : null;
  var isWorker = null;// = Object.keys(cluster.workers).length > 0 ? cluster.isWorker : null;

  try {
    if (typeof cluster.workers === 'object') {
      if (cluster.workers === null) {
        isCluster = true;
        clusterID = cluster.worker ? cluster.worker.id : null;
        isMaster = cluster.isMaster;
        isWorker = cluster.isWorker;
      }
    }
  }
  catch (ex) {
    //ignore errors
  }

  var ping = function () {
    var state = joola.state.get();
    var status = state.status;

    joola.redis.hset(key, 'uid', joola.UID);
    joola.redis.expire(key, 6);
    joola.redis.hset(key, 'state', status);
    joola.redis.hset(key, 'uptime', process.uptime());
    joola.redis.hset(key, 'usage-cpu', lastUsage.cpu);
    joola.redis.hset(key, 'usage-mem', lastUsage.memory);
    joola.redis.hset(key, 'last-seen', new Date().getTime());
    joola.redis.hset(key, 'last-seen-nice', new Date());
    joola.redis.hset(key, 'hostname', hostname);
    joola.redis.hset(key, 'cluster', isCluster);
    joola.redis.hset(key, 'cluster-id', clusterID);
    joola.redis.hset(key, 'cluster-master', isMaster);
    joola.redis.hset(key, 'cluster-slave', isWorker);
  };

  joola.state.on('state:change', ping);

  setInterval(function () {
    ping();
  }, 1000);
}

var lastUsage = {cpu: -1, memory: -1};
function watch_usage() {
  var pid = process.pid;
  var options = { keepHistory: true };
//drop the first one
  usage.lookup(pid, options, function (err, result) {
    setInterval(function () {
      usage.lookup(pid, options, function (err, result) {
        lastUsage = result;
        joola.stats.set('usage', {
          cpu$sum: result.cpu,
          mem$sum: result.memory
        });
      });
    }, 1000);
  });
}

function watch_nodes() {
  setInterval(function () {
    joola.redis.keys('nodes:*', function (err, keys) {
      joola.stats.set('node-count', {
        nodes$sum: keys.length
      });
    });
  }, 5000);
}

joola.events.on('dispatch:ready', function () {
  watch_usage();
  watch_eventloop();
  watch_state();
  watch_nodes();
  node_ping();
});
