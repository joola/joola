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
  joola = require('../joola.io'),
  os = require('os'),
  cluster = require('cluster');

/* istanbul ignore next*/
global.stopped = false;
/* istanbul ignore next*/
global.shutdown = function (code, callback) {
  if (stopped)
    return;

  stopped = true;
  joola.logger.info('Gracefully shutting down, code: ' + code);
  joola.state.set('core', 'stop', 'received code [' + code + ']');
  joola.dispatch.emit('nodes:state:change', [joola.UID, joola.state.get()]);

  var node = nodeState();
  if (node.http) {
    //We're running an http node, let's try to start another one.
    joola.logger.info('Trying to start Web Services on another node');
    joola.dispatch.request(0, 'startWebServer', [node], function () {
      //do we care?
    });
  }
  joola.redis.del('nodes:' + joola.UID, function () {
    //do we care?
  });

  setTimeout(function () {
    process.exit(code || 0);
  }, 10);

  if (typeof callback === 'function')
    return callback(null);
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

  var result = {
    uid: joola.UID,
    state: status,
    uptime: process.uptime(),
    'last-seen': new Date().getTime(),
    'last-seen-nice': new Date(),
    hostname: hostname,
    'usage-cpu': null,
    'usage-mem': null,
    http: joola.webserver.http._handle ? true : false,
    https: joola.webserver.https._handle ? true : false,
    cluster: isCluster,
    'cluster-id': clusterID,
    'cluster-master': isMaster,
    'cluster-slave': isWorker
  };

  return result;
};