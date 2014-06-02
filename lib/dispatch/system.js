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
  router = require('../webserver/routes/index');

exports.version = {
  name: "/system/version",
  description: "I print out the version",
  verb: 'GET',
  inputs: [],
  _outputExample: {},
  _permission: ['system:version'],
  _dispatch: {
    message: 'system:version'
  },
  run: function (context, callback) {
    callback = callback || function () {
    };
    return callback(null, {version: 'joola.io version ' + joola.VERSION});
  }
};

exports.nodeUID = {
  name: "/system/nodeUID",
  description: "I print out the node uuid",
  verb: 'GET',
  inputs: [],
  _outputExample: {},
  _permission: ['system:nodeuid'],
  _dispatch: {
    message: 'system:nodeuid'
  },
  run: function (context, callback) {
    callback = callback || function () {
    };
    setImmediate(function () {
      return callback(null, {UID: joola.UID});
    });
  }
};

exports.whoami = {
  name: "/api/system/whoami",
  description: "I print out the user details",
  _proto: require('./prototypes/user').proto,
  inputs: [],
  _outputExample: {},
  _permission: ['system:whoami'],
  _dispatch: {
    message: 'system:whoami'
  },
  run: function (context, callback) {
    callback = callback || function () {
    };
    setImmediate(function () {
      delete context.user.token;
      return callback(null, context.user);
    });
  }
};

exports.blacklist = {
  name: "/system/blacklist",
  description: "I blacklist an IP",
  inputs: {
    required: ['ip', 'blacklist'],
    optional: ['ttl']
  },
  _outputExample: {},
  _permission: ['system:blacklist'],
  _dispatch: {
    message: 'system:blacklist'
  },
  run: function (context, ip, blacklist, ttl, callback) {
    if (typeof ttl === 'function') {
      callback = ttl;
      ttl = -1;
    }
    callback = callback || function () {
    };

    var list = joola.config.get('interfaces:webserver:blacklist');
    if (!list)
      list = [];
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
  }
};

exports.nodeDetails = {
  name: "/system/nodeDetails",
  description: "I print details on this node",
  inputs: {
    required: [],
    optional: ['uid']
  },
  _outputExample: {},
  _permission: ['system:nodedetails'],
  _dispatch: {
    message: 'system:nodedetails'
  },
  run: function (context, uid, callback) {
    if (typeof uid === 'function') {
      callback = uid;
      uid = null;
    }
    else
      callback = callback || function () {
      };

    return process.nextTick(function () {
      return callback(null, joola.nodeState());
    });
  }
};

exports.connectedClients = {
  name: "/system/connectedClients",
  description: "I print details on all connected clients to this node",
  inputs: {
    required: [],
    optional: ['uid']
  },
  _outputExample: {},
  _permission: ['system:connectedclients'],
  _dispatch: {
    message: 'system:connectedclients'
  },
  run: function (context, uid, callback) {
    if (typeof uid === 'function') {
      callback = uid;
      uid = null;
    }
    else
      callback = callback || function () {
      };

    var result = [];
    var clients = [];

    if (joola.io && joola.io.sockets)
      clients.concat(joola.io.sockets.clients());
    if (joola.sio && joola.sio.sockets)
      clients.concat(joola.sio.sockets.clients());
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
  name: "/system/nodeList",
  description: "I list all registered nodes",
  inputs: [],
  _outputExample: {},
  _permission: ['system:nodelist'],
  _dispatch: {
    message: 'system:nodelist'
  },
  run: function (context, callback) {
    callback = callback || function () {
    };

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
  name: "/system/roundTrip",
  description: "I execute a roundtrip of a payload and return the time in ms",
  inputs: ['start'],
  _outputExample: {},
  _permission: ['system:roundtrip'],
  _dispatch: {
    message: 'roundtrip'
  },
  _route: null,
  run: function (context, start, callback) {
    callback = callback || function () {
    };
    var duration = new Date().getTime() - parseInt(start);
    return callback(null, duration);
  }
};

/* istanbul ignore next */
exports.terminate = {
  name: "/system/terminate",
  description: "I terminate a node",
  inputs: {
    required: [],
    optional: ['uid']
  },
  _outputExample: {},
  _permission: ['system:terminate'],
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
      callback = callback || function () {
      };

    if (!uid) {
      joola.shutdown();
      return callback(null);
    }
    else if (uid == joola.UID) {
      joola.shutdown();
      return callback(null);
    }
  }
};

/* istanbul ignore next */
exports.startWebServer = {
  name: "/system/startWebServer",
  description: "I start a WebServer on a node",
  inputs: ['node'],
  _outputExample: {},
  _permission: ['system:startWebServer'],
  _dispatch: {
    message: 'startWebServer'
  },
  _route: null,
  run: function (context, node, callback) {
    callback = callback || function () {
    };
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
  name: "/system/purgeCache",
  description: "I purge the cache",
  inputs: {
    required: [],
    optional: []
  },
  _outputExample: {},
  _permission: ['system:purgeCache'],
  _dispatch: {
    message: 'purgeCache',
    limit: -1
  },
  _route: null,
  run: function (context, callback) {
    callback = callback || function () {
    };

    joola.mongo.dropDatabase('cache', function (err) {
      return callback(null);
    });
  }
};

exports.usage = {
  name: "/system/usage",
  description: "I report usage by workspace and username",
  inputs: ['workspace', 'username', 'collection'],
  _outputExample: {},
  _permission: ['system:usage'],
  _dispatch: {
    message: 'system:usage'
  },

  run: function (context, workspace, username, collection, callback) {
    if (typeof workspace === 'function') {
      callback = workspace;
      workspace = null;
      collection = null;
      username = null;
    }
    else if (typeof username === 'function') {
      callback = username;
      username = null;
      collection = null;
    }
    else if (typeof collection === 'function') {
      callback = collection;
      collection = null;
    }
    callback = callback || function () {
    };

    var query = {
      timeframe: 'last_year',
      //interval: 'month',
      //dimensions: [
      //  {key: 'timestamp', collection: 'query'}
      //],
      metrics: [
        {key: 'readCount', collection: 'query'},
        {key: 'writeCount', collection: 'beacon'}
      ],
      filter: [],
      realtime: true
    };
    if (workspace)
      query.filter.push(['workspace', 'eq', workspace]);
    if (username)
      query.filter.push(['username', 'eq', username]);
    if (collection)
      query.filter.push(['collection', 'eq', collection]);
    joola.query.fetch({user: joola.STATS_USER}, query, function (err, result) {
      if (err)
        return callback(err);

      return callback(null, result);
    });
  }
};