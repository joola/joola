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
    host: 'localhost',
    port: 6379,
    db: 3,
    pass: null
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
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
  app.use(api.api);

  app.use(status.status);
  app.use(errors.error_400);
  app.use(errors.error_500);

  router.setup(app);

  var startHTTP = function (callback) {
    self.http = http.createServer(app).listen(self.options.port,function (err) {
      if (err) {
        return callback(err);
      }

      joola.logger.debug('joola.io HTTP server listening on port ' + self.options.port);
      joola.state.set('webserver-http', 'working', 'webserver-http is up.');

      var socketioWildcard = require('socket.io-wildcard');
      joola.io = socketioWildcard(require('socket.io')).listen(self.http, { log: false });
      joola.io.set('log level', 3);

      var RedisStore = require('socket.io/lib/stores/redis')
        , redis = require('socket.io/node_modules/redis')
        , client = redis.createClient();

      client.select(3, function (err) {
        joola.io.set('store', new RedisStore({
          redis: redis
        }));
      });

      joola.io.set('authorization', function (handshakeData, callback) {
        if (!handshakeData.headers.cookie) return callback('socket.io: no found cookie.', false);

        var signedCookies = require('express/node_modules/cookie').parse(handshakeData.headers.cookie);
        handshakeData.cookies = require('express/node_modules/connect/lib/utils').parseSignedCookies(signedCookies, self.options.sessionSecret);

        sessionStore.get(handshakeData.cookies['sid'], function (err, session) {
          if (err || !session) return callback('socket.io: no found session.', false);
          handshakeData.session = session;
          if (handshakeData.session['joolaio-token']) {
            return callback(null, true);
          } else {
            return callback('socket.io: no found session.user', false);
          }
        });
      });

      joola.io.sockets.on('connection', function (socket) {
        socket.on('*', function (event) {
          var req = {};
          req.query = {};
          req.params = event.args || {};
          req.params.resource = event.name.split('/')[1];
          req.params.action = event.name.split('/')[2];
          req.url = '';
          req.session = socket.handshake.session;

          var res = {};
          res.status = function (statuscode) {

          };
          res.setHeader = function (header, value) {

          };
          res.json = function (json) {
            return socket.emit(event.name + ':done', json);
          };

          return joola.auth.middleware(req, res, function () {
            return router.route(req, res);
          });
        });
      });

      return callback(null, self.http);
    }).on('error',function (err) {
        if (err.code == 'EADDRINUSE' && joola.config.get('webserver')) {
          //fireof an immediate callback with the error
          return callback(err);
        }
        else if (err.code == 'EADDRINUSE') {
          joola.logger.debug('[ignore] joola.io HTTP server server error: ' + (typeof(err) === 'object' ? err.message : err));
          joola.state.set('webserver-http', 'working', 'HTTP webserver-https is disabled.');
        }
        else {
          joola.logger.debug('joola.io HTTP server error: ' + (typeof(err) === 'object' ? err.message : err));
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
      return callback(null, self.https);
    }).on('error',function (err) {
        if (err.code == 'EADDRINUSE' && joola.config.get('webserver')) {
          //fireof an immediate callback with the error
          return callback(err);
        }
        else if (err.code == 'EADDRINUSE') {
          joola.logger.debug('[ignore] joola.io HTTPS server server error: ' + (typeof(err) === 'object' ? err.message : err));
          joola.state.set('webserver-https', 'working', 'HTTPS webserver-https is disabled.');
        }
        else {
          joola.logger.debug('joola.io HTTPS server error: ' + (typeof(err) === 'object' ? err.message : err));
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
    delete joola.state.controls['webserver-https'];
  }
  async.parallel(calls, function (err) {
    if (typeof callback === 'function')
      callback(err);
  });
};

webserver.stop = function (callback) {
  var self = webserver;

  if (self.http)
    self.http.close();
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