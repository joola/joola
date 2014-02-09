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
  router = require('../webserver/routes/index');


//joola.dispatch.system.listnodes(function(err,nodes){console.log(err,nodes)})

exports.listnodes = {
  name: "/api/system/listnodes",
  description: "I list all registered nodes",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'system:listnodes'
  },
  run: function (context, callback) {
    callback = callback || emptyfunc;

    var nodes = [];

    joola.redis.keys('nodes:*', function (err, nodeKeys) {
      if (err)
        return callback(err);

      var expected = nodeKeys.length;
      var counter = 0;
      nodeKeys.forEach(function (node) {
        joola.redis.hgetall(node, function (err, node) {
          nodes.push(node);
          counter++;
          if (counter == expected)
            return callback(err, nodes);
        });
      });
    });
  }
};

exports.roundtrip = {
  name: "/api/system/roundtrip",
  description: "I execute a roundtrip of a payload and return the time in ms",
  inputs: ['start'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'roundtrip'
  },
  _route: null,
  run: function (context, start, callback) {
    callback = callback || emptyfunc;
    var duration = new Date().getTime() - parseInt(start);
    return callback(null, duration);
  }
};

exports.terminate = {
  name: "/api/system/terminate",
  description: "I terminate a node",
  inputs: ['start'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'terminate',
    limit: -1
  },
  _route: null,
  run: function (context, uid, callback) {
    callback = callback || emptyfunc;
    if (uid == joola.UID) {
      global.shutdown();
      return callback(null);
    }
  }
};

exports.startWebServer = {
  name: "/api/system/startWebServer",
  description: "I start a WebServer on a node",
  inputs: ['node'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'startWebServer'
  },
  _route: null,
  run: function (context, node, callback) {
    callback = callback || emptyfunc;
    var found = false;
    if (node.hostname == os.hostname()) {
      found = true;
      joola.logger.info('Detected request to start web server in exchange of [' + node.uid + '], allowing grace...');
      setTimeout(function () {
        joola.logger.info('Attempting start of web server in exchange of [' + node.uid + ']');
        joola.webserver.start({}, function (err) {
          if (err)
            return callback(err);
          return callback(null, true);
        });
      }, 3000);
    }
    if (!found)
      return callback(null);
  }
};

exports.dummy = {
  name: "/api/system/dummy",
  description: "dummy",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'dummy'
  },
  _route: null,
  run: function (context, start, callback) {
    callback = callback || emptyfunc;


    return callback(null, duration);
  }
};

exports.block = {
  name: "/api/system/block",
  description: "block",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'block'
  },
  _route: null,
  run: function (context, callback) {
    callback = callback || emptyfunc;

    console.time('blocking-loop');
    //for (var i = 0, len = 5000000; i < len; i++) {
    //}

    //require('sleep').sleep(3);
    console.timeEnd('blocking-loop');

    return callback(null, true);
  }
};


exports.subscribe_dispatch = {
  name: "/api/system/subscribe_dispatch",
  description: "subscribe_dispatch",
  inputs: ['socketid'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'subscribe_dispatch',
    limit: -1,
    criteria: 'all'
  },
  _route: null,
  run: function (context, socketid, callback) {
    callback = callback || emptyfunc;

    joola.dispatch.tracers.push(socketid);

    return callback(null, true);
  }
};