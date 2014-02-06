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
  fs = require('fs'),
  path = require('path'),
  async = require('async'),
  http = require('http'),
  https = require('https'),
  express = require('express'),

  connect = require('connect'),
  cookie = require('cookie'),

  auth = require('../auth'),
  api = require('./middleware/api'),
  status = require('./middleware/status'),
  errors = require('./middleware/error'),
  router = require('./routes');

var webserver = module.exports = app = express();

webserver.start = function (options, callback) {
  var self = webserver;

  self.options = {
    port: joola.config.interfaces.webserver.port,
    securePort: joola.config.interfaces.webserver.securePort,
    secure: true,
    secureOnly: false,
    keyFile: path.join(__dirname, '../../config/certs/localhost.key'),
    certFile: path.join(__dirname, '../../config/certs/localhost.csr'),
    viewsPath: __dirname + '/views',
    sessionSecret: '491b8a10-573d-11e3-949a-0800200c9a66',
    sessionTimeout: new Date(Date.now() + 3600000)
  };
  self.options = joola.common._extend(self.options, options);

  //var sessionStore = new express.session.MemoryStore({reapInterval: 60000 * 10});
  var RedisStore = require('connect-redis')(express);
  var sessionStore = new RedisStore({
    host: joola.config.store.socketio.host,
    port: joola.config.store.socketio.port,
    db: joola.config.store.socketio.DB,
    pass: joola.config.store.socketio.pass
  });
  app.set('views', self.options.viewsPath);
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/shared/ico/favicon.ico'));
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    store: sessionStore,
    secret: self.options.sessionSecret,
    maxAge: self.options.sessionTimeout,
    expires: self.options.sessionTimeout,
    key: 'sid'
  }));
  //app.use(express.logger());
  app.use(function (req, res, next) {
    req.start_ts = new Date();
    return next();
  });


  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "joolaio-token, joolaio-APIToken, Content-Type");

    next();
  });

  app.use(express.static(path.join(__dirname, 'public')));
  //app.use(express.static(path.join(__dirname, '/../sdk/bin')));

  app.use(app.router);
  app.use(api.api);

  app.use(status.status);
  app.use(errors.error_400);
  app.use(errors.error_500);

  router.setup(app);

  var handleSocketIOConnection = function (socket) {
    socket.on('*', function (event) {
      if (event.args[0] === 'testmessage') {
        return socket.emit('testmessage', event.args[1]);
      }

      var req = {};
      req.start_ts = new Date();
      req.fake = true;
      req.query = {};
      req.params = {};

      var path = event.args[0]._path;
      req.params.args = event.args;
      req.params.resource = path.split('/')[1];//event.name.split('/')[1];
      req.params.action = path.split('/')[2];
      req.url = path;
      req.session = socket.handshake.session;

      var res = {};
      res.fake = true;
      res.socket = socket;
      res.status = function (statuscode) {

      };
      res.setHeader = function (header, value) {

      };
      res.json = function (json) {
        return socket.emit(event.name + ':done', json);
      };

      Object.keys(req.params.args[0]).forEach(function (key, i) {
        req.params[key] = req.params.args[0][key];
      });

      //if (req.params._token) {
      if (!req.headers)
        req.headers = {};
      req.headers['joolaio-token'] = req.params.args[0]._token;
      //}
      req.headers['joolaio-apitoken'] = req.params.args[0].APIToken;

      delete req.params._token;
      delete req.params.args;
      delete req.params._path;

      if (req.params.resource == 'users' && req.params.action == 'authenticate') {
        req.token = {_: joola.config.authentication.bypassToken};
        joola.logger.trace('Applying bypass token for request [3].');
      }

      return joola.auth.middleware(req, res, function () {
        return router.route(req, res);
      });
    });
  };

  var startHTTP = function (callback) {
    self.http = http.createServer(app).listen(self.options.port,function (err) {
      if (err) {
        return callback(err);
      }

      joola.logger.debug('joola.io HTTP server listening on port ' + self.options.port);
      joola.state.set('webserver-http', 'working', 'webserver-http is up.');

      var socketioWildcard = require('socket.io-wildcard');
      joola.io = socketioWildcard(require('socket.io')).listen(self.http, { log: false });
      joola.io.enable('browser client minification');  // send minified client
      joola.io.enable('browser client etag');          // apply etag caching logic based on version number
      joola.io.enable('browser client gzip');          // gzip the file
      joola.io.set('log level', 1);

      var
        RedisStore = require('socket.io/lib/stores/redis'),
        redis = require('socket.io/node_modules/redis'),
        client = redis.createClient(joola.config.store.socketio.redis);


      joola.io.set('store', new RedisStore({
        redisClient: client
      }));


      /*
       joola.io.set('authorization', function (handshakeData, callback) {
       if (!handshakeData.headers.cookie) return callback('socket.io: no found cookie.', false);

       var signedCookies = require('cookie').parse(handshakeData.headers.cookie);
       handshakeData.cookies = require('connect').utils.parseSignedCookies(signedCookies, self.options.sessionSecret);

       sessionStore.get(handshakeData.cookies.sid, function (err, session) {
       if (err || !session) return callback('socket.io: no found session.', false);
       handshakeData.session = session;
       if (handshakeData.session['joolaio-token']) {
       return callback(null, true);
       } else {
       return callback('socket.io: no found session.user', false);
       }
       });
       });*/

      joola.io.sockets.on('connection', handleSocketIOConnection);

      return callback(null, self.http);
    }).on('error',function (err) {
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
    try {
      secureOptions = {
        key: fs.readFileSync(self.options.keyFile),
        cert: fs.readFileSync(self.options.certFile)
      };
    }
    catch (ex) {
      return callback(ex);
    }
    self.https = https.createServer(secureOptions, app).listen(self.options.securePort,function (err) {
      if (err) {
        return callback(err);
      }

      joola.logger.debug('joola.io HTTPS server listening on port ' + self.options.securePort);
      joola.state.set('webserver-https', 'working', 'webserver-https is up.');


      var secure_socketioWildcard = require('socket.io-wildcard');
      joola.sio = secure_socketioWildcard(require('socket.io')).listen(self.https, {secure: true, log: false });

      joola.sio.enable('browser client minification');  // send minified client
      joola.sio.enable('browser client etag');          // apply etag caching logic based on version number
      joola.sio.enable('browser client gzip');          // gzip the file
      joola.sio.set('log level', 1);

      joola.sio.sockets.on('connection', handleSocketIOConnection);

      return callback(null, self.https);
    }).on('error',function (err) {
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
        joola.logger.debug('joola.io HTTPS server listening on port ' + self.options.securePort + ' received a CLOSE command.');
        joola.state.set('webserver-https', 'failure', 'HTTPS webserver-https is stopped.');
      });
  };

  var calls = [];
  if (!self.options.secureOnly) {
    calls.push(startHTTP);
  }
  if (self.options.secure) {
    calls.push(startHTTPS);
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

webserver.stop = function (callback) {
  var self = webserver;

  if (self.http) {
    self.http.close();
  }
  if (self.https)
    self.https.close();

  if (typeof callback === 'function')
    callback(null);
};

webserver.verify = function (callback) {
  if (joola.state.controls['webserver-http'].state != 'working' ||
    (joola.state.controls['webserver-https'] && joola.state.controls['webserver-https'].state != 'working')) {
    return callback(new Error('Failed to validate servers'));

  }
  else {
    //webserver is live (if it should be)
    return callback(null);
  }
};