/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  joola = require('../joola.io'),
  os = require('os'),

  cluster = require('cluster');

/* istanbul ignore next*/
global.stopped = false;

global.silentShutdown = function (code, callback) {
  try {
    if (stopped)
      return;

    stopped = true;
    joola.logger.warn('Gracefully shutting down, code: ' + code);
    joola.state.set('core', 'stop', 'received code [' + code + ']');
    joola.dispatch.emit('nodes:state:change', [joola.UID, joola.state.get()]);

    var node = nodeState();
    if (node.http) {
      //We're running an http node, let's try to start another one.
      joola.logger.debug('Trying to start Web Services on another node');
      joola.dispatch.request(0, 'startWebServer', [node], function () {
        //do we care?
      });
    }
    joola.redis.del('nodes:' + joola.UID, function (err) {
      //do we care?
    });

    if (typeof callback === 'function')
      return callback(null);
  }
  catch (ex) {
    return callback(ex);
  }
};

/* istanbul ignore next*/
global.shutdown = function (code, callback) {
  setTimeout(function () {
    console.log('Failed to gracefully shutdown, exiting.');
    process.exit();
  }, 5000);

  silentShutdown(code, function () {
    setTimeout(function () {
      process.exit(code || 0);
    }, 10);

    if (typeof callback === 'function')
      return callback(null);
  });
};
/* istanbul ignore next*/
global.emptyfunc = function () {

};
/* istanbul ignore next*/
global.rt = function () {
  joola.dispatch.roundtrip(function (err, delta) {
    if (err)
      return console.log('Roundtrip: ' + err);
    return console.log('Roundtrip: ' + delta + 'ms');
  });
};

global.nodeState = function () {
  var hostname = joola.hostname = os.hostname();
  var osDetails = {
    type: os.type(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptime: os.uptime(),
    loadavg: os.loadavg(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    cpus: os.cpus()
  };
  var isCluster = false; //Object.keys(cluster.workers).length > 0;
  var clusterID = null;// = cluster.worker ? cluster.worker.id : null;
  var isMaster = null;// = Object.keys(cluster.workers).length > 0 ? cluster.isMaster : null;
  var isWorker = null;// = Object.keys(cluster.workers).length > 0 ? cluster.isWorker : null;

  /* istanbul ignore next*/
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

  var state = joola.state.get();
  var status = state.status;

  var httpState = false;
  var httpsState = false;

  if (joola.webserver && joola.webserver.http)
    httpState = joola.webserver.http._handle !== null;
  if (joola.webserver && joola.webserver.https)
    httpState = joola.webserver.https._handle !== null;

  return {
    uid: joola.UID,
    state: status,
    uptime: process.uptime(),
    lastSeen: new Date().getTime(),
    lastSeenNice: new Date(),
    hostname: hostname,
    os: osDetails,
    usageCPU: global.lastUsage.cpu,
    usageMem: global.lastUsage.memory,
    http: httpState,
    https: httpsState,
    cluster: isCluster,
    clusterID: clusterID,
    clusterMaster: isMaster,
    clusterSlave: isWorker,
    connectedSockets: (joola.io ? joola.io.connectCounter : -1)
  };
};