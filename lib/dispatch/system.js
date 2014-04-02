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

exports.version = {
  name: "/api/system/version",
  description: "I print out the version",
  inputs: [],
  _outputExample: {},
  _permission: ['access_system'],
  _dispatch: {
    message: 'system:version'
  },
  run: function (context, callback) {
    callback = callback || emptyfunc;
    return callback(null, 'joola.io version ' + joola.VERSION);
  }
};

exports.nodeUID = {
  name: "/api/system/nodeUID",
  description: "I print out the node uuid",
  inputs: [],
  _outputExample: {},
  _permission: ['access_system'],
  _dispatch: {
    message: 'system:nodeuid'
  },
  run: function (context, callback) {
    callback = callback || emptyfunc;
    return callback(null, joola.UID);
  }
};

exports.blacklist = {
  name: "/api/system/blacklist",
  description: "I blacklist an IP",
  inputs: {
    required: ['ip', 'blacklist'],
    optional: ['ttl']
  },
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'system:blacklist'
  },
  run: function (context, ip, blacklist, ttl, callback) {
    if (typeof ttl === 'function') {
      callback = ttl;
      ttl = -1;
    }
    callback = callback || emptyfunc;

    joola.config.get('interfaces:webserver:blacklist', function (err, list) {
      if (blacklist) {
        joola.logger.info('Blacklisting [' + ip + '] with ttl [' + ttl + '].');
        if (list.indexOf(ip) == -1)
          list.push(ip);
      }
      else {
        joola.logger.info('Releasing Blacklist for [' + ip + '].');
        list.splice(list.indexOf(ip), 1);
      }

      joola.config.set('interfaces:webserver:blacklist', list, function (err) {
        if (err)
          return callback(err);

        if (ttl > 0) {
          setTimeout(function () {
            exports.blacklist.run(context, ip, false, -1);
          }, ttl);
        }
        return callback(null);
      });
    });
  }
};

exports.nodeDetails = {
  name: "/api/system/nodeDetails",
  description: "I print details on this node",
  inputs: {
    required: [],
    optional: ['uid']
  },
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'system:nodedetails'
  },
  run: function (context, uid, callback) {
    if (typeof uid === 'function') {
      callback = uid;
      uid = null;
    }
    else
      callback = callback || emptyfunc;

    return process.nextTick(function () {
      return callback(null, nodeState());
    });
  }
};

exports.connectedClients = {
  name: "/api/system/connectedClients",
  description: "I print details on all connected clients to this node",
  inputs: {
    required: [],
    optional: ['uid']
  },
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'system:connectedclients'
  },
  run: function (context, uid, callback) {
    if (typeof uid === 'function') {
      callback = uid;
      uid = null;
    }
    else
      callback = callback || emptyfunc;

    var result = [];
    var clients = joola.io.sockets.clients();
    clients.forEach(function (c) {
      result.push({
        id: c.id,
        connected: !c.disconnected,
        readable: c.readable,
        flags: c.flags,
        address: c.manager.handshaken[c.id].address
      });
    });

    return callback(null, result);
  }
};

exports.nodeList = {
  name: "/api/system/nodeList",
  description: "I list all registered nodes",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'system:nodelist'
  },
  run: function (context, callback) {
    callback = callback || emptyfunc;

    var nodes = [];
    joola.redis.keys('nodes:*', function (err, nodeKeys) {
      /* istanbul ignore if */
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

exports.roundTrip = {
  name: "/api/system/roundTrip",
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

/* istanbul ignore next */
exports.terminate = {
  name: "/api/system/terminate",
  description: "I terminate a node",
  inputs: {
    required: [],
    optional: ['uid']
  },
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'terminate',
    limit: -1
  },
  _route: null,
  run: function (context, uid, callback) {
    if (typeof uid === 'function') {
      callback = uid;
      uid = null;
    }
    else
      callback = callback || emptyfunc;

    if (!uid) {
      global.shutdown();
      return callback(null);
    }
    else if (uid == joola.UID) {
      global.shutdown();
      return callback(null);
    }
  }
};

/* istanbul ignore next */
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

exports.purgeCache = {
  name: "/api/system/purgeCache",
  description: "I purge the cache",
  inputs: {
    required: [],
    optional: []
  },
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'purgeCache',
    limit: -1
  },
  _route: null,
  run: function (context, callback) {
    callback = callback || emptyfunc;

    joola.mongo.dropDatabase('cache', function (err) {
      joola.mongo.dropDatabase('cache-second', function (err) {
        joola.mongo.dropDatabase('cache-minute', function (err) {
          joola.mongo.dropDatabase('cache-hour', function (err) {
            joola.mongo.dropDatabase('cache-ddate', function (err) {
              joola.mongo.dropDatabase('cache-month', function (err) {
                joola.mongo.dropDatabase('cache-year', function (err) {
                  return callback(null);
                });
              });
            });
          });
        });
      });
    });
  }
};