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
    if (delta > 1500) {
      joola.stats.set('eventlooplocks', {
        eventlooplocks$sum: 1
      });
      joola.logger.warn('Blocked event-loop, ' + delta.toString() + 'ms, since: ' + new Date(lastTime).format('hh:nn:ss.fff'));
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
    else
      joola.logger.info('State changed to [' + message[1].status + ']');

    //remove it from node list
    if (message[1].status != 'working' && message[1].status != 'online')
      joola.redis.del('nodes:' + message[0]);
  });

  setInterval(function () {
    var status = joola.state.get().status;
    if (status != lastStatus) {
      joola.logger.debug('Status change, joola.io is now [' + status + ']');
      lastStatus = status;
      joola.state.emit('state:change', status);
      joola.dispatch.emit('nodes:state:change', [joola.UID, joola.state.get()]);
    }
  }, 1000);
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

    var node = nodeState();
    node['usage-cpu'] = lastUsage.cpu;
    node['usage-mem'] = lastUsage.memory;

    joola.redis.hmset(key, node, function (err) {
      joola.redis.expire(key, 6);
    });

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
