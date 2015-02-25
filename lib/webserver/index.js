/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var
  joola = require('../../joola'),

  fs = require('fs'),
  path = require('path'),
  async = require('async'),
  http = require('http'),
  https = require('https'),
  express = require('express'),
  bodyParser = require('body-parser'),
  compress = require('compression'),
  connect = require('connect'),
  domain = require('domain'),
  url = require('url'),
  querystring = require('querystring'),

  meta = require('./middleware/meta'),
  router = require('./routes');

var webserver = module.exports = app = express();
webserver.routes = router;

webserver.start = function (options, callback) {
  var self = webserver;

  self.options = {
    port: joola.config.get('interfaces:webserver:port') || 8080,
    secureport: joola.config.get('interfaces:webserver:secureport') || 8081,
    secure: joola.config.get('interfaces:webserver:secure') !== false,
    secureonly: joola.config.get('interfaces:webserver:secureonly') || false,
    keyfile: joola.config.get('interfaces:webserver:keyfile'),
    certfile: joola.config.get('interfaces:webserver:certfile'),
    ca: joola.config.get('interfaces:webserver:ca') || null,
    viewsPath: __dirname + '/views'
  };

  self.options = joola.common._extend(self.options, options);
  app.use(compress());
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
  }));

  app.use(bodyParser.json({limit: '50mb'}));
  app.disable('x-powered-by');

  //check the system is online
  app.use(function (req, res, next) {
    req.timestamps = {
      start: new Date().getTime()
    };
    /* istanbul ignore if */
    if (joola.state.get().status !== 'online')
      return next(new Error('System offline'));
    return next();
  });

  //blacklist checks
  app.use(function (req, res, next) {
    req.uuid = joola.UID + ':' + new Date().getTime() + ':' + joola.common.uuid();
    //check for blacklisting
    var blacklist = joola.config.get('interfaces:webserver:blacklist');
    /* istanbul ignore if */
    if (blacklist) {
      if (blacklist.indexOf(req.connection.remoteAddress) > -1) {
        joola.logger.trace(req, 'Blacklisted IP: ' + req.connection.remoteAddress);
        return next(new Error('Blacklisted IP: ' + req.connection.remoteAddress));
      }
    }

    return next();
  });

  function stampHeaders(req, res, next) {
    /* istanbul ignore if */
    if (joola.config.get('interfaces:webserver:host'))
      res.header("Server", joola.config.get('interfaces:webserver:host'));

    var allowOrigin = joola.config.get('interfaces:webserver:alloworigin') || req.headers.origin;
    /* istanbul ignore if */
    if (allowOrigin)
      res.header("Access-Control-Allow-Origin", allowOrigin);
    res.header("Access-Control-Allow-Headers", "content-type");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Expose-Headers", "ETag, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset");
    res.header("X-joola-Request-Id", req.uuid || null);

    res.header("X-Frame-Options", 'SAMEORIGIN');
    res.header("X-XSS-Protection", '1; mode=block');
    res.header("X-Content-Type-Options", 'nosniff');

    var headers = joola.config.get('interfaces:webserver:headers')||{};
    /* istanbul ignore next */
    Object.keys(headers).forEach(function (key, i) {
      var value = headers[key];
      if (key && value) {
        res.header(key, value);
      }
    });

    next();
  }

  app.use(stampHeaders);
  app.use(express.static(path.join(__dirname, '../../node_modules/joola.sdk/build/release')));

  app.use(meta());
  app.use(function (req, res, next) {
    joola.events.emit('event_start');
    return next(null);
  });
  router.setup(app);
  var socketIORedisOptions = {
    http: {
      host: 'localhost',
      port: 6379,
      db: 0,
      auth: null,
      redisOptions: null
    },
    https: {
      host: 'localhost',
      port: 6379,
      db: 0,
      auth: null,
      redisOptions: null
    }
  };
  var socketIORedisConfig = joola.config.get('store:websocket:redis');
  /* istanbul ignore if */
  if (socketIORedisConfig && typeof socketIORedisConfig.enabled === 'undefined')
    socketIORedisConfig.enabled = true;
  var parsed_url, parsed_auth;
  if (socketIORedisConfig && socketIORedisConfig.enabled && socketIORedisConfig.dsn) {
    parsed_url = url.parse(socketIORedisConfig.dsn);
    parsed_auth = (parsed_url.auth || '').split(':');
    socketIORedisOptions.enabled = true;
    socketIORedisOptions.http.redisOptions = querystring.parse(parsed_url.query);
    socketIORedisOptions.http.host = parsed_url.host.split(':')[0];
    socketIORedisOptions.http.port = parsed_url.port || 6379;
    socketIORedisOptions.http.db = parsed_auth[0];
    socketIORedisOptions.http.auth = parsed_auth[1];
  }
  joola.connectCounter = 0;
  var handleSocketIOConnection = function (socket) {
    joola.connectCounter++;

    socket.on('disconnect', function () {
      joola.connectCounter--;
    });

    socket.onevent = function (packet) {
      var d = domain.create();
      var req = {};
      var res = {};
      /* istanbul ignore next */
      d.on('error', function (err) {
        joola.events.emit('event_end');
        joola.logger.warn('Failed to route request: ' + err);
        return router.responseError(500, new router.ErrorTemplate('Failed to route request: ' + err), req, res);
      });
      joola.events.emit('event_start');
      d.add(req);
      d.add(res);

      d.run(function () {
        var event = {
          name: packet.data[0],
          args: [packet.data[1]]
        };

        /* istanbul ignore if */
        if (event.name === 'echo') {
          return socket.emit('echo', event.args[0]);
        }

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
          res.headers = res.headers || {};
          res.headers.StatusCode = res.statusCode;
          res.headers.Status = res.statusCode + ' ' + http.STATUS_CODES[res.statusCode];

          var result = {
            headers: res.headers,
            message: json
          };
          return socket.emit(event.name + ':done', result);
        };
        req.uuid = joola.UID + ':' + new Date().getTime() + ':' + joola.common.uuid();
        req.fake = true;
        req.query = {};
        req.params = {};
        req.connection = {
          remoteAddress: null //socket.handshake.address.address || 'n/a'
        };
        req.timestamps = {
          start: new Date().getTime()
        };

        /* istanbul ignore if */
        if (event.args.length === 0)
          return socket.emit(event.name + ':done', new Error('Missing arguments'));

        var path = event.args[0]._path || event.name;
        req.params.args = event.args;
        req.params.resource = path.split('/')[0];//event.name.split('/')[1];
        req.params.action = path.split('/')[1];
        req.url = path;
        //req.session = socket.handshake.session;

        req.parsed = {};
        Object.keys(req.params.args[0]).forEach(function (key, i) {
          req.params[key] = req.params.args[0][key];
          if (['APIToken', '_token', '_path', '_route'].indexOf(key) === -1)
            req.parsed[key] = req.params.args[0][key];
        });

        req.headers = req.headers || {};
        req.headers['joola-token'] = req.params.args[0]._token;
        req.headers['joola-apitoken'] = req.params.args[0].APIToken;
        delete req.params._token;
        delete req.params.APIToken;
        delete req.params.args;
        delete req.params._path;
        delete req.params._route;

        req.endpoint = '/' + path;
        req.endpointRoute = {
          module: path.split('/')[0],
          action: path.split('/')[1]
        };
        return stampHeaders(req, res, function () {
          return joola.auth.middleware(req, res, function () {
            return router.router(req, res);
          });
        });
      });
    };
  };

  joola.connectCounter = 0;

  var startHTTP = function (callback) {
    self.http = http.createServer(app).listen(self.options.port, self.options.bind || '0.0.0.0', function (err) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      joola.logger.info('joola HTTP server listening on port [' + (self.options.bind || '0.0.0.0' ) + ':' + self.options.port + '].');
      joola.state.set('webserver-http', 'working', 'webserver-http is up.');

      joola.io = require('socket.io')(self.http, {'log level': 1});

      if (socketIORedisOptions && socketIORedisOptions.enabled) {
        var
          RedisStore = require('socket.io-redis'),
          redis = require('redis'),
          pub = redis.createClient(socketIORedisOptions.http.port, socketIORedisOptions.http.host, {return_buffers: true}),
          sub = redis.createClient(socketIORedisOptions.http.port, socketIORedisOptions.http.host, {return_buffers: true});

        /* istanbul ignore next */
        pub.on('error', function (err) {
          joola.logger.warn('Redis Error on IO-publisher: ' + err);
        });
        /* istanbul ignore next */
        sub.on('error', function (err) {
          joola.logger.warn('Redis Error on IO-subscriber: ' + err);
        });

        pub.on('connect', function () {
          joola.logger.trace('Redis Connect on IO-publisher.');
        });
        sub.on('connect', function () {
          joola.logger.trace('Redis Connect on IO-subscriber.');
        });

        var redisPass = joola.config.get('store:websocket:http:redis:pass');
        /* istanbul ignore if */
        if (redisPass) {
          pub.auth(redisPass, function (err) {
            if (err)
              return joola.logger.trace('Redis pass failed for IO-publisher: ' + err);
          });
          sub.auth(redisPass, function (err) {
            if (err)
              return joola.logger.trace('Redis pass failed for IO-subscriber: ' + err);
          });
        }
        var db = joola.config.get('store:websocket:http:redis:db') || 0;
        /* istanbul ignore if */
        if (db > 0) {
          pub.select(db, function (err) {
            if (err)
              return joola.logger.trace('Redis SELECT failed for IO-publisher: ' + err);

            return joola.logger.trace('Redis SELECT OK IO-publisher: ' + db);
          });
          sub.select(db, function (err) {
            if (err)
              return joola.logger.trace('Redis SELECT failed for IO-publisher: ' + err);

            return joola.logger.trace('Redis SELECT OK IO-subscriber: ' + db);
          });
        }
        joola.io.adapter(RedisStore({key: 'clear', pubClient: pub, subClient: sub}));
      }
      joola.io.connectCounter = 0;
      joola.io.sockets.on('connection', handleSocketIOConnection);

      return callback(null, self.http);
    }).on('connection', function (socket) {
      sockets.push(socket);
      socket.on('close', function () {
        sockets.splice(sockets.indexOf(socket), 1);
      });
    }).on('error', function (err) {
      if (err.code == 'EADDRINUSE' && (joola.config.get('webserver') || options.webserver)) {
        joola.logger.warn('[--webserver] joola HTTP server server error: ' + (typeof(err) === 'object' ? err.message : err));
        //fireof an immediate callback with the error
        return callback(err);
      }
      else if (err.code == 'EADDRINUSE') {
        joola.logger.debug('[ignore] joola HTTP server server error: ' + (typeof(err) === 'object' ? err.message : err));
        joola.state.set('webserver-http', 'working', 'HTTP webserver-https is disabled.');
        return callback(null);
      }
      else {
        joola.logger.debug('joola HTTP server error: ' + (typeof(err) === 'object' ? err.message : err));
        return callback(err);
      }
    }).on('close', function () {
      joola.logger.debug('joola HTTP server listening on port ' + self.options.port + ' received a CLOSE command.');
      joola.state.set('webserver-http', 'failure', 'HTTP webserver-http is stopped.');
    });
  };

  var startHTTPS = function (callback) {
    var secureOptions;

    joola.logger.debug('Loading SSL certificates: ' + self.options.keyfile + ', ' + self.options.certfile);
    /* istanbul ignore if */
    if (!fs.existsSync(self.options.keyfile)) {
      joola.logger.error('SSL key file missing: ' + self.options.keyfile);
      return callback(new Error('SSL key file missing: ' + self.options.keyfile));
    }
    /* istanbul ignore if */
    if (!fs.existsSync(self.options.certfile)) {
      joola.logger.error('SSL certificate file missing: ' + self.options.certfile);
      return callback(new Error('SSL certificate file missing: ' + self.options.certfile));
    }

    /* istanbul ignore if */
    if (self.options.ca) {
      if (!fs.existsSync(self.options.ca)) {
        joola.logger.error('SSL CA file missing: ' + self.options.ca);
        return callback(new Error('SSL CA file missing: ' + self.options.ca));
      }
    }

    try {
      secureOptions = {
        key: fs.readFileSync(self.options.keyfile),
        cert: fs.readFileSync(self.options.certfile)
      };
      if (self.options.ca) {
        secureOptions.ca = fs.readFileSync(self.options.ca);
        //secureOptions.requestCert = true;
        secureOptions.rejectUnauthorized = false;
      }
    }
    catch (ex) {
      return callback(ex);
    }

    self.https = https.createServer(secureOptions, app).listen(self.options.secureport, self.options.bind || '0.0.0.0', function (err) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      joola.logger.info('joola HTTPS server listening on port [' + (self.options.bind || '0.0.0.0') + ':' + self.options.secureport + '].');
      joola.state.set('webserver-https', 'working', 'webserver-https is up.');

      joola.sio = require('socket.io')(self.https, {secure: true, log: false});
      if (socketIORedisOptions && socketIORedisOptions.enabled) {
        var
          secureRedisStore = require('socket.io-redis'),
          secureRedis = require('redis'),
          securePub = secureRedis.createClient(socketIORedisOptions.https.port, socketIORedisOptions.https.host, {return_buffers: true}),
          secureSub = secureRedis.createClient(socketIORedisOptions.https.port, socketIORedisOptions.https.host, {return_buffers: true});

        /* istanbul ignore next */
        securePub.on('error', function (err) {
          joola.logger.warn('Redis Error on SIO-publisher: ' + err);
        });
        /* istanbul ignore next */
        secureSub.on('error', function (err) {
          joola.logger.warn('Redis Error on SIO-subscriber: ' + err);
        });

        securePub.on('connect', function () {
          joola.logger.trace('Redis Connect on SIO-publisher.');
        });
        secureSub.on('connect', function () {
          joola.logger.trace('Redis Connect on SIO-subscriber.');
        });

        var redisPass = joola.config.get('store:websocket:https:redis:pass');
        /* istanbul ignore if */
        if (redisPass) {
          securePub.auth(redisPass, function (err) {
            if (err)
              return joola.logger.debug('Redis pass failed for SIO-subscriber: ' + err);
          });
          secureSub.auth(redisPass, function (err) {
            if (err)
              return joola.logger.debug('Redis pass failed for SIO-publisher: ' + err);
          });
        }

        var secureDb = joola.config.get('store:websocket:https:redis:db') || 0;
        /* istanbul ignore if */
        if (secureDb > 0) {
          securePub.select(secureDb, function (err) {
            if (err)
              return joola.logger.debug('Redis SELECT failed for SIO-publisher: ' + err);

            return joola.logger.debug('Redis SELECT OK SIO-publisher: ' + secureDb);
          });
          secureSub.select(secureDb, function (err) {
            if (err)
              return joola.logger.debug('Redis SELECT failed for SIO-publisher: ' + err);

            return joola.logger.debug('Redis SELECT OK SIO-subscriber: ' + secureDb);
          });
        }
        joola.sio.adapter(secureRedisStore({key: 'secure', pubClient: securePub, subClient: secureSub}));
      }
      joola.sio.sockets.on('connection', handleSocketIOConnection);
      return callback(null, self.https);
    }).on('connection', function (socket) {
      sockets.push(socket);
      socket.on('close', function () {
        sockets.splice(sockets.indexOf(socket), 1);
      });
    }).on('error', function (err) {
      if (err.code == 'EADDRINUSE' && (joola.options.webserver || options.webserver)) {
        //fireof an immediate callback with the error
        joola.logger.warn('[--webserver] joola HTTP server server error: ' + (typeof(err) === 'object' ? err.message : err));
        return callback(err);
      }
      else if (err.code == 'EADDRINUSE') {
        joola.logger.debug('[ignore] joola HTTPS server server error: ' + (typeof(err) === 'object' ? err.message : err));
        joola.state.set('webserver-https', 'working', 'HTTPS webserver-https is disabled.');
        return callback(null);
      }
      else {
        joola.logger.debug('joola HTTPS server error: ' + (typeof(err) === 'object' ? err.message : err));
        return callback(err);
      }
    }).on('close', function () {
      joola.logger.debug('joola HTTPS server listening on port ' + self.options.secureport + ' received a CLOSE command.');
      joola.state.set('webserver-https', 'failure', 'HTTPS webserver-https is stopped.');
    });
  };

  var calls = [];
  if (!self.options.secureonly) {
    joola.logger.debug('Running HTTP. This is not recommended, read more at http://github.com/joola/joola/wiki.');
    calls.push(startHTTP);
  }

  /* istanbul ignore else */
  if (self.options.secure) {
    calls.push(startHTTPS);
  }
  else {
    joola.logger.debug('Running without HTTPS. This is not recommended, read more at http://github.com/joola/joola/wiki.');
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

  setTimeout(function () {
    if (self.http) {
      self.http.close();
    }
    if (self.https) {
      self.https.close();
    }

    if (typeof callback === 'function')
      callback(null);
  }, 500);
};

webserver.verify = function (callback) {
  var self = webserver;

  if (!self.options.secureonly) {
    if (joola.state.controls['webserver-http'].state != 'working')
      return callback(new Error('Failed to validate servers'));
  }
  if (self.options.secure) {
    /* istanbul ignore if */
    if (joola.state.controls['webserver-https'].state != 'working')
      return callback(new Error('Failed to validate servers'));
  }

  return callback(null);
};