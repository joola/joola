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

  domain = require('domain'),
  path = require('path'),
  fs = require('fs'),
  url = require('url'),
  auth = require('../../auth'),
  _ = require('underscore');

function ErrorTemplate(err) {
  if (err.message) this.message = err.message; else this.message = err || '';
  if (err.stack) this.stack = err.stack; else this.stack = null;
}
ErrorTemplate.prototype = Error.prototype;
exports.ErrorTemplate = ErrorTemplate;

exports.responseError = function (code, err, req, res) {
  joola.logger.warn(err, 'Error while processing route [' + req.url + ']: ' + (typeof(err) === 'object' ? err.message : err));
  if (err.stack)
    joola.logger.trace(err.stack);

  if (code == 401) {
    res.status(401);
    joola.logger.trace({category: 'security'}, '[webrouter] Request auth error: ' + err);
  }
  else if (code == 404) {
    res.status(404);
    joola.logger.trace({category: 'security'}, '[webrouter] Missing route: ' + err);
  }
  else if (code) {
    res.status(code);
    joola.logger.trace({category: 'security'}, '[webrouter] Error while routing: ' + err);
  }
  else {
    res.status(500);
    joola.logger.trace({category: 'exception'}, '[webrouter] Exception: ' + err);
  }

  err.message = err.message || 'unknown error';
  err.documentation_url = 'http://github.com/joola/joola.io/wiki';

  delete err.stack;
  delete err.code;

  res.json(err);
  res.handled = true;
};

exports.responseSuccess = function (data, headers, req, res) {
  var meta = {};

  //var realtime = data ? data.realtime : false;
  if (req.timestamps.start) {
    req.timestamps.end = new Date().getTime();
    res.header('X-JoolaIO-Duration', req.timestamps.end - req.timestamps.start);
  }

  if (headers && headers.from)
    res.header('X-JoolaIO-Requested-By', headers.from);
  if (headers && headers['fulfilled-by'])
    res.header('X-JoolaIO-Fulfilled-By', headers['fulfilled-by']);
  if (headers && headers['fulfilled-duration'])
    res.header('X-JoolaIO-Duration-Fulfilled', headers['fulfilled-duration']);

  try {
    if (req.params && !req.params.minres) {
      meta.id = joola.common.uuid();
      meta.timestamp = new Date();
      meta.success = true;
      meta.details = {};
      meta.details.request = req.debug;
    }

    res.status(200);

    if (!req.user)
      return exports.responseError(401, new Error('missing user'), req, res);
    else if (!req.user.roles)
      return exports.responseError(401, new Error('missing roles'), req, res);
    else if (req.user.permissions && req.user.permissions.indexOf('misc:see_private') > -1)
      data = joola.common.sanitize(data, req.action._proto, true);
    else if (req.action._proto)
      data = joola.common.sanitize(data, req.action._proto);
    else if (req.action._proto === null)
      data = null;
    else {
      //do nothing
    }

    joola.logger.trace({category: 'security'}, '[webrouter] Request success.');
    /*
     res.json({
     meta: meta,
     message: data
     });*/
    res.json(data);
  }
  catch (ex) {
    console.log('response exception', ex.message);
    console.log(ex.stack);
    console.dir(ex);
  }
};

exports.index = function (req, res) {
  res.render('index', {version: joola.VERSION});
};

exports.sdk = function (min, _req, _res) {
  var sdkConfig = joola.config.get('sdk');
  if (sdkConfig && sdkConfig.url && sdkConfig.url !== '') {
    var request = require('request');
    joola.logger.warn('Fetching SDK from url [' + sdkConfig.url + ']');
    request.get(sdkConfig.url, function (err, response, jsContent) {
      if (err)
        return exports.responseError(500, 'Failed to fetch SDK from [' + sdkConfig.url + ']', _req, _res);

      if (_req && _req.url) {
        var parts = require('url').parse(_req.url);
        var qs = require('querystring').parse(parts.query);

        if (qs.token) {
          jsContent += '\n' + ';joolaio.set(\'token\', \'' + qs.token + '\');';
          _res.setHeader('joola-token', qs.token);
        }
      }
      _res.setHeader('Content-Type', 'text/javascript');
      return _res.end(jsContent);
    });
  }
  else {
    var jsContent;
    var filename;
    if (min === true)
      filename = path.join(__dirname, '../../../node_modules/joola.io.sdk/bin/', 'joola.io.min.js');
    else {
      if (min) {
        _res = _req;
        _req = min;
        min = null;
      }
      filename = path.join(__dirname, '../../../node_modules/joola.io.sdk/bin/', 'joola.io.js');
    }
    fs.readFile(filename, function read(err, data) {
      /* istanbul ignore if */
      if (err) {
        joola.logger.warn(_req, 'Error while loading SDK from disk: ' + err);
        return _res.send('Failed to load file: ' + err);
      }

      var parts = require('url').parse(_req.url);
      var qs = require('querystring').parse(parts.query);
      jsContent = data;
      if (qs.token) {
        jsContent += '\n' + ';joolaio.set(\'token\', \'' + qs.token + '\');';
        _res.setHeader('joola-token', qs.token);
      }

      _res.setHeader('Content-Type', 'text/javascript');
      return _res.end(jsContent);
    });
  }
};

exports.css = function (req, res) {
  var filename = path.join(__dirname, '../../../node_modules/joola.io.sdk/bin/', 'joola.io.css');
  fs.readFile(filename, function read(err, data) {
    /* istanbul ignore if */
    if (err) {
      joola.logger.warn(req, 'Error while loading SDK from disk: ' + err);
      return res.send('Failed to load file: ' + err);
    }

    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Content-Length', data ? data.length : 0);
    return res.send(data);
  });
};

exports.generateerror = function (req, res) {
  throw new Error('Error for testing');
};

exports.setup = function (app) {
  //main entry point
  app.get('/', this.index);
  app.get('/ip', function (req, res) {
    res.send('var codehelper_ip= {IP: \'' + req.connection.remoteAddress + '\'}');
  });

  //for tests
  app.get('/api/test/createtesterror', function (req, res) {
    req.params = {};
    req.params.resource = 'test';
    req.params.action = 'createtesterror';
    exports.router(req, res);
  });

  //sdk
  app.get('/joola.io.js', function (req, res) {
    return exports.sdk(false, req, res);
  });
  app.get('/joola.io.min.js', function (req, res) {
    return exports.sdk(true, req, res);
  });
  app.get('/joola.io.css', this.css);

  var middleware = require('../middleware/index').middleware;

  app.get('/system/version', middleware('/system/version'), exports.router);
  app.get('/system/whoami', middleware('/system/whoami'), exports.router);
  app.get('/system/nodeUID', middleware('/system/nodeUID'), exports.router);
  app.get('/system/nodeDetails', middleware('/system/nodeDetails'), exports.router);

  app.post('/config/:key', middleware('/config/set'), exports.router);
  app.get('/config/:key', middleware('/config/get'), exports.router);
  app.patch('/config/:key', middleware('/config/set'), exports.router);

  app.get('/workspaces', middleware('/workspaces/list'), exports.router);
  app.post('/workspaces', middleware('/workspaces/add'), exports.router);
  app.get('/workspaces/:key', middleware('/workspaces/get'), exports.router);
  app.patch('/workspaces/:key', middleware('/workspaces/patch'), exports.router);
  app.delete('/workspaces/:key', middleware('/workspaces/delete'), exports.router);

  app.get('/collections/:workspace', middleware('/collections/list'), exports.router);
  app.post('/collections/:workspace', middleware('/collections/add'), exports.router);
  app.get('/collections/:workspace/:key', middleware('/collections/get'), exports.router);
  app.patch('/collections/:workspace/:key', middleware('/collections/patch'), exports.router);
  app.delete('/collections/:workspace/:key', middleware('/collections/delete'), exports.router);
  app.post('/collections/:workspace/:key/metadata', middleware('/collections/metadata'), exports.router);

  app.get('/collections/:workspace/:collection/dimensions', middleware('/dimensions/list'), exports.router);
  app.post('/collections/:workspace/:collection/dimensions', middleware('/dimensions/add'), exports.router);
  app.get('/collections/:workspace/:collection/dimensions/:key', middleware('/dimensions/get'), exports.router);
  app.patch('/collections/:workspace/:collection/dimensions/:key', middleware('/dimensions/patch'), exports.router);
  app.delete('/collections/:workspace/:collection/dimensions/:key', middleware('/dimensions/delete'), exports.router);

  app.get('/permissions', middleware('/permissions/list'), exports.router);
  app.get('/permissions/:key', middleware('/permissions/get'), exports.router);

  app.get('/roles/:workspace', middleware('/roles/list'), exports.router);
  app.post('/roles/:workspace', middleware('/roles/add'), exports.router);
  app.get('/roles/:workspace/:key', middleware('/roles/get'), exports.router);
  app.patch('/roles/:workspace/:key', middleware('/roles/patch'), exports.router);
  app.delete('/roles/:workspace/:key', middleware('/roles/delete'), exports.router);

  app.get('/users/:workspace', middleware('/users/list'), exports.router);
  app.post('/users/:workspace', middleware('/users/add'), exports.router);
  app.get('/users/:workspace/:key', middleware('/users/get'), exports.router);
  app.patch('/users/:workspace/:key', middleware('/users/patch'), exports.router);
  app.delete('/users/:workspace/:key', middleware('/users/delete'), exports.router);
  app.get('/users/:workspace/:key/permissions', middleware('/users/permissions'), exports.router);

  app.post('/tokens', middleware('/users/generateToken'), exports.router);
  app.get('/tokens/:token', middleware('/users/validateToken'), exports.router);
  app.delete('/tokens/:token', middleware('/users/expireToken'), exports.router);

  app.get('/apitokens/:token', middleware('/users/verifyAPIToken'), exports.router);
};

exports.router = function (req, res, next) {
  //check the request should be terminated, signaled by prior middleware
  if (req.terminate)
    return res.end();
  var d = domain.create();
  d.on('error', function (err) {
    joola.logger.warn('Failed to route request: ' + err);
    return exports.responseError(500, new ErrorTemplate('Failed to route request: ' + err), req, res);
  });
  d.add(req);
  d.add(res);
  d.run(function () {
    //check if we're stopped (emergency was called)
    if (joola.stopped)
      if (res.render)
        return exports.responseError(503, new ErrorTemplate('server-offline'), req, res);

    if (joola.state.get().status != 'online') {
      if (res.render)
        return exports.responseError(503, new ErrorTemplate('server-offline'), req, res);
      else
        return exports.responseError(503, new ErrorTemplate('server-offline'), req, res);
    }

    var moduleName = req.endpointRoute.module;
    var actionName = req.endpointRoute.action;
    var module = require('../../dispatch/' + moduleName);
    var action = module[actionName];

    req.action = action;

    var dispatchRoute = function (req, res) {
      if (!action)
        return exports.responseError(500, new exports.ErrorTemplate('Missing action [' + action.name + ']'), req, res);
      var timerID = 0;
      var aborted;
      setImmediate(function () {
        if (!action._dispatch)
          return exports.responseError(500, new exports.ErrorTemplate('Missing dispatch for [' + action.name + ']'), req, res);
        joola.dispatch.request(req.token._ || req.token, action._dispatch.message, req.parsed, function (err, result, headers) {
          clearTimeout(timerID);
          if (aborted)
            return;
          if (err)
            return exports.responseError(err.code || 500, err, req, res);
          return exports.responseSuccess(result, headers, req, res);
        });
        timerID = setTimeout(function () {
          return exports.responseError(408, new exports.ErrorTemplate('Timeout while waiting for [' + action.name + ']'), req, res);
        }, joola.config.get('interfaces:webserver:timeout') || 60000);
      });
    };
    if (action && action._route)
      return action._route(req, res);
    else
      return dispatchRoute(req, res);
  });
};
