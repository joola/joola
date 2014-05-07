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
      joola.common.sanitize(data, req.action._proto);
    else if (!req.user._roles)
      joola.common.sanitize(data, req.action._proto);
    else if (req.user._roles.indexOf('root') == -1)
      joola.common.sanitize(data, req.action._proto);
    else
      joola.common.sanitize(data, req.action._proto, true);
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

exports.route = function (req, res) {
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
        return res.render('server-offline');

    if (joola.state.get().status != 'online') {
      if (res.render)
        return res.render('server-offline');
      else
        return res.json('server-offline');
    }

    var modulename = req.params.resource;
    var module;
    var action = req.params.action;

    if (!req.token && modulename != 'test' && modulename != 'users')
      return exports.responseError(401, new ErrorTemplate('Missing token.'), req, res);
    else if (!req.token && (modulename == 'test' || modulename == 'users')) {
      req.token = {_: joola.config.get('authentication:bypassToken')};
      joola.logger.trace('Applying bypass token for request [4].');
    }

    if (['png', 'ico', 'gif', 'css'].indexOf(req.url.substring(req.url.length - 3)) > -1)
      return exports.responseError(501, new ErrorTemplate('Not implemented.'), req, res);

    _.extend(req.params, req.query);

    if (!modulename)
      return exports.responseError(404, new ErrorTemplate('Module not specified.'), req, res);

    try {
      module = require('../../dispatch/' + modulename);
    }
    catch (ex) {
      console.log('err', ex);
      console.log(ex.stack);
      return exports.responseError(404, ex, req, res);
    }

    if (!action)
      action = 'index';

    action = module[action];
    if (req.params[0] instanceof Object) {
      Object.keys(req.params[0]).forEach(function (key) {
        try {
          req.params[key] = req.params[0][key];
        }
        catch (ex) {
          //ignore
        }
      });
    }
    joola.logger.silly('Routing [' + action.name + ']...');

    var dispatchRoute = function (req, res) {
      var _params = {};
      Object.keys(req.params).forEach(function (p) {
        if (p != 'resource' && p != 'action')
          _params[p] = req.params[p];
      });
      var aborted, timerID;

      delete _params.resource;
      delete _params.action;

      if (action.inputs) {
        var inputs;
        if (action.inputs.required)
          inputs = action.inputs.required.concat(action.inputs.optional);
        else
          inputs = action.inputs;

        if (inputs.indexOf('APIToken') === -1)
          delete _params.APIToken;
      }

      setImmediate(function () {
        if (!action._dispatch)
          console.log(action);
        joola.dispatch.request(req.token._, action._dispatch.message, _params, function (err, result) {
          clearTimeout(timerID);

          if (aborted)
            return;
          if (err)
            return exports.responseError(err.code || 500, err, req, res);
          return exports.responseSuccess(result, req, res);
        });
        timerID = setTimeout(function () {
          return exports.responseError(408, new exports.ErrorTemplate('Timeout while waiting for [' + action.name + ']'), req, res);
        }, joola.config.get('interfaces:webserver:timeout') || 60000);
      });
    };

    if (req.params.options && req.params.options.local)
      return action._route(req, res);
    else if (req.params.options && req.params.options.local === false)
      return dispatchRoute(req, res);
    else if (action._route) {
      return action._route(req, res);
    }
    else {
      return dispatchRoute(req, res);
    }
  });
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

  //api routes
  app.get('/api/:resource/:action', auth.middleware, this.route);
  app.post('/api/:resource/:action', auth.middleware, this.route);

  var middleware = require('../middleware/index');

  app.get('/system/version', middleware.middleware, exports.router('/system/version'));
  app.get('/system/whoami', middleware.middleware, exports.router('/system/whoami'));
  app.get('/system/nodeUID', middleware.middleware, exports.router('/system/nodeUID'));
  app.get('/system/nodeDetails', middleware.middleware, exports.router('/system/nodeDetails'));

  app.post('/config/:key', middleware.middleware, exports.router('/config/set'));
  app.get('/config/:key', middleware.middleware, exports.router('/config/get'));
  app.patch('/config/:key', middleware.middleware, exports.router('/config/set'));

  app.get('/workspaces', middleware.middleware, exports.router('/workspaces/list'));
  app.post('/workspaces', middleware.middleware, exports.router('/workspaces/add'));
  app.get('/workspaces/:key', middleware.middleware, exports.router('/workspaces/get'));
  app.patch('/workspaces/:key', middleware.middleware, exports.router('/workspaces/patch'));
  app.delete('/workspaces/:key', middleware.middleware, exports.router('/workspaces/delete'));
  
  app.get('/permissions', middleware.middleware, exports.router('/permissions/list'));
  app.get('/permissions/:key', middleware.middleware, exports.router('/permissions/get'));

  app.get('/roles/:workspace', middleware.middleware, exports.router('/roles/list'));
  app.post('/roles/:workspace', middleware.middleware, exports.router('/roles/add'));
  app.get('/roles/:workspace/:key', middleware.middleware, exports.router('/roles/get'));
  app.patch('/roles/:workspace/:key', middleware.middleware, exports.router('/roles/patch'));
  app.delete('/roles/:workspace/:key', middleware.middleware, exports.router('/roles/delete'));

  app.get('/users/:workspace', middleware.middleware, exports.router('/users/list'));
  app.get('/users/:workspace/:key', middleware.middleware, exports.router('/users/get'));

  app.get('/collections/:workspace', middleware.middleware, exports.router('/collections/list'));
  app.post('/collections/:workspace', middleware.middleware, exports.router('/collections/add'));
  app.get('/collections/:workspace/:key', middleware.middleware, exports.router('/collections/get'));
  app.put('/collections/:workspace/:key', middleware.middleware);
  app.delete('/collections/:workspace/:key', middleware.middleware, exports.router('/collections/delete'));
};

exports.router = function (endpoint) {
  return function (req, res, next) {
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

      var moduleName = endpoint.split('/')[1];
      var actionName = endpoint.split('/')[2];
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
          joola.dispatch.request(req.token._, action._dispatch.message, req.parsed, function (err, result, headers) {
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
};