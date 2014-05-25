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
  joola = require('../../joola.io'),

  fs = require('fs'),
  path = require('path'),
  async = require('async'),
  http = require('http'),
  https = require('https'),
  express = require('express'),
  favicon = require('static-favicon'),
  bodyParser = require('body-parser'),
  compress = require('compression'),
  connect = require('connect'),

  auth = require('../auth'),
  meta = require('./middleware/meta'),
  router = require('./routes');

var webserver = module.exports = app = express();

webserver.start = function (options, callback) {
  var self = webserver;

  self.options = {
    port: joola.config.get('interfaces:webserver:port') || 8080,
    secureport: joola.config.get('interfaces:webserver:secureport') || 8081,
    secure: joola.config.get('interfaces:webserver:secure') || true,
    secureonly: joola.config.get('interfaces:webserver:secureonly') || false,
    keyfile: joola.config.get('interfaces:webserver:keyfile'),
    certfile: joola.config.get('interfaces:webserver:certfile'),
    viewsPath: __dirname + '/views'
  };

  self.options = joola.common._extend(self.options, options);

  app.set('views', self.options.viewsPath);
  app.set('view engine', 'jade');
  app.use(favicon(__dirname + '/public/ico/favicon.ico'));
  app.use(compress());
  app.use(bodyParser({limit: '50mb'}));
  app.disable('x-powered-by');

  //check the system is online
  app.use(function (req, res, next) {
    req.timestamps = {
      start: new Date().getTime()
    };
    if (joola.state.get().status !== 'online')
      return next(new Error('System offline'));
    return next();
  });

  //blacklist checks
  app.use(function (req, res, next) {
    req.uuid = joola.UID + ':' + new Date().getTime() + ':' + joola.common.uuid();
    //check for blacklisting
    var blacklist = joola.config.get('interfaces:webserver:blacklist');
    if (blacklist) {
      if (blacklist.indexOf(req.connection.remoteAddress) > -1) {
        joola.logger.trace(req, 'Blacklisted IP: ' + req.connection.remoteAddress);
        return next(new Error('Blacklisted IP: ' + req.connection.remoteAddress));
      }
    }

    return next();
  });

  app.use(function (req, res, next) {
    res.header("Server", joola.config.get('interfaces:webserver:host') || 'N/A');

    var allowOrigin = joola.config.get('interfaces:webserver:alloworigin') || req.headers.origin;
    if (allowOrigin)
      res.header("Access-Control-Allow-Origin", allowOrigin);
    res.header("Access-Control-Allow-Headers", "content-type");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Expose-Headers", "ETag, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset");
    res.header("X-JoolaIO-Request-Id", req.uuid || null);

    res.header("X-Frame-Options", 'SAMEORIGIN');
    res.header("X-XSS-Protection", '1; mode=block');
    res.header("X-Content-Type-Options", 'nosniff');

    var headers = joola.config.get('interfaces:webserver:headers');
    if (!headers)
      headers = {};
    Object.keys(headers).forEach(function (key, i) {
      var value = headers[key];
      if (key && value) {
        res.header(key, value);
      }
    });

    next();
  });

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, '../../node_modules/joola.io.sdk/bin')));
  app.use(express.static(path.join(__dirname, '../../node_modules/joola.io.sdk/build/release')));

  app.use(meta());

  router.setup(app);

  var
    RedisStore = require('socket.io/lib/stores/redis'),
    redis = require('socket.io/node_modules/redis'),
    pub = redis.createClient(joola.config.get('store:websocket:http:redis:port') || 6379, joola.config.get('store:websocket:http:redis:host') || 'localhost'),
    sub = redis.createClient(joola.config.get('store:websocket:http:redis:port') || 6379, joola.config.get('store:websocket:http:redis:host') || 'localhost'),
    client = redis.createClient(joola.config.get('store:websocket:http:redis:port') || 6379, joola.config.get('store:websocket:http:redis:host') || 'localhost');

  var
    secureRedisStore = require('socket.io/lib/stores/redis'),
    secureRedis = require('socket.io/node_modules/redis'),
    securePub = redis.createClient(joola.config.get('store:websocket:https:redis:port') || 6379, joola.config.get('store:websocket:https:redis:host') || 'localhost'),
    secureSub = redis.createClient(joola.config.get('store:websocket:https:redis:port') || 6379, joola.config.get('store:websocket:https:redis:host') || 'localhost'),
    secureClient = redis.createClient(joola.config.get('store:websocket:https:redis:port') || 6379, joola.config.get('store:websocket:https:redis:host') || 'localhost');

  pub.on('error', function (err) {
    joola.logger.warn('Redis Error on IO-publisher: ' + err);
  });
  sub.on('error', function (err) {
    joola.logger.warn('Redis Error on IO-subscriber: ' + err);
  });
  client.on('error', function (err) {
    joola.logger.warn('Redis Error on IO-client: ' + err);
  });

  pub.on('connect', function () {
    joola.logger.debug('Redis Connect on IO-publisher.');
  });
  sub.on('connect', function () {
    joola.logger.debug('Redis Connect on IO-subscriber.');
  });
  client.on('connect', function () {
    joola.logger.debug('Redis Connect on IO-client.');
  });
  securePub.on('error', function (err) {
    joola.logger.warn('Redis Error on SIO-publisher: ' + err);
  });
  secureSub.on('error', function (err) {
    joola.logger.warn('Redis Error on SIO-subscriber: ' + err);
  });
  secureClient.on('error', function (err) {
    joola.logger.warn('Redis Error on SIO-client: ' + err);
  });

  securePub.on('connect', function () {
    joola.logger.debug('Redis Connect on SIO-publisher.');
  });
  secureSub.on('connect', function () {
    joola.logger.debug('Redis Connect on SIO-subscriber.');
  });
  secureClient.on('connect', function () {
    joola.logger.debug('Redis Connect on SIO-client.');
  });

  var redisPass = joola.config.get('store:websocket:http:redis:pass');
  if (redisPass) {
    pub.auth(redisPass, function (err) {
      if (err) {
      }
    });
    sub.auth(redisPass, function (err) {
      if (err) {
      }
    });
    client.auth(redisPass, function (err) {
      if (err) {
      }
    });
  }
  var db = joola.config.get('store:websocket:http:redis:db') || 0;
  if (db > 0) {
    pub.select(db, function (err) {
      if (err) {
        console.log('select error', err);
      }
    });
    sub.select(db, function (err) {
      if (err) {
        console.log('select error', err);
      }
    });
    client.select(db, function (err) {
      if (err) {
        console.log('select error', err);
      }
    });
  }
  redisPass = joola.config.get('store:websocket:https:redis:pass');
  if (redisPass) {
    securePub.auth(redisPass, function (err) {
      if (err) {
      }
    });
    secureSub.auth(redisPass, function (err) {
      if (err) {
      }
    });
    secureClient.auth(redisPass, function (err) {
      if (err) {
      }

    });
  }
  db = joola.config.get('store:websocket:https:redis:db') || 0;
  if (db > 0) {
    securePub.select(db, function (err) {
      if (err) {
        console.log('select error', err);
      }
    });
    secureSub.select(db, function (err) {
      if (err) {
        console.log('select error', err);
      }
    });
    secureClient.select(db, function (err) {
      if (err) {
        console.log('select error', err);
      }
    });
  }
  joola.connectCounter = 0;

  var handleSocketIOConnection = function (socket) {
    joola.connectCounter++;
    socket.on('disconnect', function () {
      joola.connectCounter--;
    });

    socket.on('*', function (event) {
      if (event.name === 'testmessage') {
        return socket.emit('testmessage', event.args[0]);
      }
      var req = {};
      req.uuid = joola.UID + ':' + new Date().getTime() + ':' + joola.common.uuid();
      req.fake = true;
      req.query = {};
      req.params = {};
      req.connection = {
        remoteAddress: socket.handshake.address.address || 'n/a'
      };
      req.timestamps = {
        start: new Date().getTime()
      };

      if (event.args.length === 0)
        return socket.emit(event.name + ':done', new Error('Missing arguments'));

      var path = event.args[0]._path || event.name;
      req.params.args = event.args;
      req.params.resource = path.split('/')[0];//event.name.split('/')[1];
      req.params.action = path.split('/')[1];
      req.url = path;
      //req.session = socket.handshake.session;

      var res = {};
      res.fake = true;
      res.socket = socket;
      res.statusCode = 200;
      res.status = function (statuscode) {
        res.statusCode = statuscode;
      };

      res.setHeader = function (header, value) {

      };
      res.header = function (header, value) {
        if (!res.headers)
          res.headers = {};

        res.headers[header] = value;
      };
      res.json = function (json, headers) {
        res.headers = headers || {};
        res.headers.StatusCode = res.statusCode;
        res.headers.Status = res.statusCode + ' ' + http.STATUS_CODES[res.statusCode];

        var result = {
          headers: res.headers,
          message: json
        };
        return socket.emit(event.name + ':done', result);
      };

      req.parsed = {};
      Object.keys(req.params.args[0]).forEach(function (key, i) {
        req.params[key] = req.params.args[0][key];
        if (['APIToken', '_token', '_path'].indexOf(key) === -1)
          req.parsed[key] = req.params.args[0][key];
      });

      //if (req.params._token) {
      if (!req.headers)
        req.headers = {};
      req.headers['joolaio-token'] = req.params.args[0]._token;
      req.headers['joolaio-apitoken'] = req.params.args[0].APIToken;

      delete req.params._token;
      delete req.params.APIToken;
      delete req.params.args;
      delete req.params._path;

      req.endpoint = '/' + path;
      req.endpointRoute = {
        module: path.split('/')[0],
        action: path.split('/')[1]
      };

      return joola.auth.middleware(req, res, function () {
        return router.router(req, res);
      });
    });
  };

  joola.connectCounter = 0;

  var startHTTP = function (callback) {
    self.http = http.createServer(app).listen(self.options.port, self.options.bind || '0.0.0.0', function (err) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      joola.logger.debug('joola.io HTTP server listening on port ' + self.options.port);
      joola.state.set('webserver-http', 'working', 'webserver-http is up.');

      var socketioWildcard = require('socket.io-wildcard');
      joola.io = socketioWildcard(require('socket.io')).listen(self.http, { secure: false, log: true });
      joola.io.configure(function () {
        joola.io.set('close timeout', 60 * 60 * 24); // 24h time out
      });
      joola.io.enable('browser client minification');  // send minified client
      joola.io.enable('browser client etag');          // apply etag caching logic based on version number
      joola.io.enable('browser client gzip');          // gzip the file
      joola.io.set('log level', 0);
      joola.io.set('transports', [                     // enable all transports (optional if you want flashsocket)
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
      ]);
      joola.io.set('store', new RedisStore({redis: redis, redisPub: pub, redisSub: sub, redisClient: client}));
      joola.io.sockets.on('connection', handleSocketIOConnection);

      return callback(null, self.http);
    }).on('connection', function (socket) {
      sockets.push(socket);
      socket.on('close', function () {
        sockets.splice(sockets.indexOf(socket), 1);
      });
    }).on('error', function (err) {
      if (err.code == 'EADDRINUSE' && (joola.config.get('webserver') || options.webserver)) {

        //fireof an immediate callback with the error
        return callback(err);
      }
      else if (err.code == 'EADDRINUSE') {
        joola.logger.debug('[ignore] joola.io HTTP server server error: ' + (typeof(err) === 'object' ? err.message : err));
        joola.state.set('webserver-http', 'working', 'HTTP webserver-https is disabled.');
        return callback(null);
      }
      else {
        joola.logger.debug('joola.io HTTP server error: ' + (typeof(err) === 'object' ? err.message : err));
        return callback(err);
      }
    }).on('close', function () {
      joola.logger.debug('joola.io HTTP server listening on port ' + self.options.port + ' received a CLOSE command.');
      joola.state.set('webserver-http', 'failure', 'HTTP webserver-http is stopped.');
    });
  };

  var startHTTPS = function (callback) {
    var secureOptions;

    joola.logger.debug('Loading SSL certrificates: ' + self.options.keyfile + ', ' + self.options.certfile);
    if (!fs.existsSync(self.options.keyfile)) {
      joola.logger.error('SSL key file missing: ' + self.options.keyfile);
      return callback(new Error('SSL key file missing: ' + self.options.keyfile));
    }
    if (!fs.existsSync(self.options.certfile)) {
      joola.logger.error('SSL certificate file missing: ' + self.options.certfile);
      return callback(new Error('SSL certificate file missing: ' + self.options.certfile));
    }
    try {
      secureOptions = {
        key: fs.readFileSync(self.options.keyfile),
        cert: fs.readFileSync(self.options.certfile)
      };
    }
    catch (ex) {
      return callback(ex);
    }
    self.https = https.createServer(secureOptions, app).listen(self.options.secureport, self.options.bind || '0.0.0.0', function (err) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      joola.logger.debug('joola.io HTTPS server listening on port ' + self.options.secureport);
      joola.state.set('webserver-https', 'working', 'webserver-https is up.');

      var secure_socketioWildcard = require('socket.io-wildcard');
      joola.sio = secure_socketioWildcard(require('socket.io')).listen(self.https, {secure: true, log: false });
      joola.sio.configure(function () {
        joola.sio.set('close timeout', 60 * 60 * 24); // 24h time out
      });
      joola.sio.enable('browser client minification');  // send minified client
      joola.sio.enable('browser client etag');          // apply etag caching logic based on version number
      joola.sio.enable('browser client gzip');          // gzip the file
      joola.sio.set('log level', 0);
      joola.sio.set('transports', [                     // enable all transports (optional if you want flashsocket)
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
      ]);
      joola.sio.set('store', new secureRedisStore({redis: secureRedis, redisPub: securePub, redisSub: secureSub, redisClient: secureClient}));

      joola.sio.sockets.on('connection', handleSocketIOConnection);
      return callback(null, self.https);
    }).on('connection', function (socket) {
      sockets.push(socket);
      socket.on('close', function () {
        sockets.splice(sockets.indexOf(socket), 1);
      });
    }).on('error', function (err) {
      if (err.code == 'EADDRINUSE' && (joola.config.get('webserver') || options.webserver)) {
        //fireof an immediate callback with the error
        return callback(err);
      }
      else if (err.code == 'EADDRINUSE') {
        joola.logger.debug('[ignore] joola.io HTTPS server server error: ' + (typeof(err) === 'object' ? err.message : err));
        joola.state.set('webserver-https', 'working', 'HTTPS webserver-https is disabled.');
        return callback(null);
      }
      else {
        joola.logger.debug('joola.io HTTPS server error: ' + (typeof(err) === 'object' ? err.message : err));
        return callback(err);
      }
    }).on('close', function () {
      joola.logger.debug('joola.io HTTPS server listening on port ' + self.options.secureport + ' received a CLOSE command.');
      joola.state.set('webserver-https', 'failure', 'HTTPS webserver-https is stopped.');
    });
  };

  var calls = [];
  if (!self.options.secureonly) {
    joola.logger.warn('Running HTTP. This is not recommended, read more at http://github.com/joola/joola.io/wiki.');
    calls.push(startHTTP);
  }
  if (self.options.secure) {
    calls.push(startHTTPS);
  }
  else {
    joola.logger.warn('Running without HTTPS. This is not recommended, read more at http://github.com/joola/joola.io/wiki.');
  }
  if (!joola.config.get('webserver')) {
    delete joola.state.controls['webserver-http'];
    delete joola.state.controls['webserver-https'];
  }
  async.series(calls, function (err) {
    if (typeof callback === 'function')
      callback(err);
  });
};

var sockets = [];
webserver.stop = function (callback) {
  var self = webserver;

  joola.logger.warn('Stopping HTTP/HTTPs web servers.');

  for (var i = 0; i < sockets.length; i++) {
    sockets[i].destroy();
  }

  if (self.http) {
    self.http.close();
  }
  if (self.https) {
    self.https.close();
  }

  if (typeof callback === 'function')
    callback(null);
};

webserver.verify = function (callback) {
  var self = webserver;

  if (!self.options.secureonly) {
    if (joola.state.controls['webserver-http'].state != 'working')
      return callback(new Error('Failed to validate servers'));
  }
  if (self.options.secure) {
    if (joola.state.controls['webserver-https'].state != 'working')
      return callback(new Error('Failed to validate servers'));
  }

  return callback(null);
};