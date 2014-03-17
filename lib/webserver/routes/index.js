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

  path = require('path'),
  fs = require('fs'),
  url = require('url'),
  auth = require('../../auth'),
  querystring = require('querystring'),
  _ = require('underscore');

function ErrorTemplate(err) {
  this.name = 'joola.io.engine Exception';
  this.code = 500;
  if (err.message) this.message = err.message; else this.message = err || '';
  if (err.stack) this.stack = err.stack; else this.stack = null;
}
ErrorTemplate.prototype = Error.prototype;
exports.ErrorTemplate = ErrorTemplate;

function AuthErrorTemplate(err) {
  this.name = 'joola.io.engine Authentication Exception';
  this.code = 401;
  if (err.message) this.message = err.message; else this.message = err || '';
  if (err.stack) this.stack = err.stack; else this.stack = null;
}
AuthErrorTemplate.prototype = ErrorTemplate.prototype;
exports.AuthErrorTemplate = AuthErrorTemplate;

exports.responseError = function (err, req, res) {
  joola.logger.warn('Error while processing route [' + req.url + ']: ' + (typeof(err) === 'object' ? err.message : err));
  if (err.stack)
    joola.logger.trace(err.stack);
  //else
  //console.trace();

  if (req.start_ts) {
    //joola.common.stats({name: 'exceptions', exceptions: 1});
  }

  if (err.code && err.code == 401) {
    res.status(401);
    joola.logger.trace({category: 'security', req: req}, '[webrouter] Request auth error: ' + err);
    if (!res.fake && req.headers['content-type'] !== 'application/json') {
      var parts = url.parse(req.url);
      if (req.query) {
        delete req.query.token;
        var search = querystring.stringify(req.query);
        return res.redirect('/login?redirect=' + parts.pathname + encodeURIComponent('?' + search));
      }
      else
        return res.redirect('/login');
    } else {
      res.json(err);
      res.handled = true;
    }
  }
  else if (err.code && err.code == 'MODULE_NOT_FOUND')
    res.status(404);
  else {
    err.code = 500;
    res.status(500);
  }

  res.json(err);
  res.handled = true;
};

exports.responseSuccess = function (data, req, res) {
  var response = {};

  var realtime = data ? data.realtime : false;
  if (req.start_ts && !realtime) {
    //joola.common.stats({event: 'waittime', waittime: new Date() - req.start_ts});
  }

  try {
    if (req.token)
      res.setHeader('joola-token', req.token);

    if (!req.params.minres) {
      response.id = joola.common.uuid();
      response.timestamp = new Date();
      response.success = true;
      response.details = {};
      response.details.request = req.debug;
    }
    response = _.extend(response, data);
    response.result = data;
    res.status(200);

    if (!req.user)
      joola.common.sanitize(response);
    else if (!req.user._roles)
      joola.common.sanitize(response);
    else if (req.user._roles.indexOf('root') == -1)
      joola.common.sanitize(response);

    joola.logger.trace({category: 'security', req: req}, '[webrouter] Request success.');
    res.json(response);
  }
  catch (ex) {
    console.log('response exception', ex.message);
    console.dir(ex);
    throw ex;
  }
};

exports.index = function (req, res) {
  /*
   if (joola.state.get().status != 'online')
   return res.render('server-offline');

   res.render('index');
   */
  res.redirect('/manage/dashboard/index?' + querystring.stringify(req.query));
};

exports.manage_index = function (req, res) {
  res.render('index', {token: req.token._});
};

exports.analytics_index = function (req, res) {
  if (joola.state.get().status != 'online')
    return res.render('server-offline');

  res.render('index');
};

exports.configure = function (req, res) {
  res.render('configure');
};

exports.logger = function (req, res) {
  res.render('logger');
};

exports.route = function (req, res) {
  //check if we're stopped (emergency was called)
  if (global.stopped)
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
    return exports.responseError(new ErrorTemplate('Missing token.'), req, res);
  else if (!req.token && (modulename == 'test' || modulename == 'users')) {
    req.token = {_: joola.config.authentication.bypassToken};
    joola.logger.trace('Applying bypass token for request [4].');
  }

  if (['png', 'ico', 'gif', 'css'].indexOf(req.url.substring(req.url.length - 3)) > -1)
    return exports.responseError(new ErrorTemplate('Not implemented.'), req, res);

  _.extend(req.params, req.query);

  if (!modulename)
    return exports.responseError(new ErrorTemplate('Module not specified.'), req, res);

  try {
    module = require('../../dispatch/' + modulename);
  }
  catch (ex) {
    console.log('err', ex);
    console.log(ex.stack);
    return exports.responseError(ex, req, res);
  }

  if (!action)
    action = 'index';

  //try {
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

    joola.dispatch.request(req.token._, action._dispatch.message, _params, function (err, result) {
      clearTimeout(timerID);

      if (aborted)
        return;
      if (err)
        return exports.responseError(err, req, res);
      return exports.responseSuccess(result, req, res);
    });
    timerID = setTimeout(function () {
      return exports.responseError(new exports.ErrorTemplate('Timeout while waiting for [' + action.name + ']'), req, res);
    }, joola.config.interfaces.webserver.timeout || 15000);
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
  // }
  // catch (ex) {
  //   return exports.responseError(new ErrorTemplate(ex), req, res);
  // }
};

exports.sdk = function (req, res) {
  var jsContent;
  var filename = path.join(__dirname, '../../../node_modules/joola.io.sdk/bin/', 'joola.io.js');
  fs.readFile(filename, function read(err, data) {
    if (err) {
      //TODO: we cannot do throw, use callbacks.
      throw err;
    }

    var parts = require('url').parse(req.url);
    var qs = require('querystring').parse(parts.query);
    jsContent = data;
    if (qs.token) {
      jsContent += '\n' + 'joolaio.TOKEN = \'' + qs.token + '\'';
      res.setHeader('joola-token', qs.token);
    }

    res.setHeader('Content-Type', 'text/javascript');
    res.setHeader('Content-Length', jsContent.length);
    //res.setHeader('Last-Modified', result.timestamp);
    //res.setHeader('Cache-Control', 'public, max-age=31557600');

    return res.send(jsContent);
  });
};

exports.css = function (req, res) {
  var filename = path.join(__dirname, '../../../node_modules/joola.io.sdk/bin/', 'joola.io.css');
  fs.readFile(filename, function read(err, data) {
    if (err) {
      //TODO: we cannot do throw, use callbacks.
      throw err;
    }

    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Content-Length', data ? data.length : 0);
    return res.send(data);
  });
};

exports.generateerror = function (req, res) {
  throw new Error('Error for testing');
};

exports.login = function (req, res) {
  if (req.method == 'POST') {
    if (!req.body.email || !req.body.password)
      return res.render('login', {title: 'joola.io - Login', error: 'Username/password required'});
    var context = {user: {su: true}};
    joola.dispatch.users.authenticate(context, 'root', req.body.email, req.body.password, function (err, token) {
      if (err)
        return res.render('login', {title: 'joola.io - Login', error: err});

      if (!req.session)
        req.session = {};
      req.session['joolaio-token'] = token._;

      if (req.body.redirect && req.body.redirect != '/logout') {
        var redirectTarget = req.body.redirect + (req.body.redirect.indexOf('?') > -1 ? '&' : '?') + 'token=' + token._;
        return res.redirect(redirectTarget);
      }
      else
        return res.redirect('/?token=' + token._);
    });
  }
  else
    return res.render('login', {title: 'joola.io - Login', redirect: req.query.redirect ? req.query.redirect : ''});
};

exports.logout = function (req, res) {
  if (req.token) {
    joola.auth.expireToken(req.token, function () {
      if (!req.session)
        req.session = {};

      delete req.session['joolaio-token'];
      delete req.session.user;
      req.session.destroy();
      res.redirect('/login');
    });
  }
  else
    res.redirect('/login');
};

exports.setup = function (app) {
  //main entry point
  app.get('/', this.index);
  app.get('/login', this.login);
  app.post('/login', this.login);
  app.get('/logout', auth.middleware, this.logout);

  //for tests
  app.get('/api/test/createtesterror', function (req, res) {
    req.params = {};
    req.params.resource = 'test';
    req.params.action = 'createtesterror';
    exports.route(req, res);
  });
  app.post('/api/test/createtesterror', function (req, res) {
    req.params = {};
    req.params.resource = 'test';
    req.params.action = 'createtesterror';
    exports.route(req, res);
  });

  //sdk
  app.get('/joola.io.js', this.sdk);
  app.get('/joola.io.css', this.css);

  //direct query
  app.get('/api/query/fetch/:APIToken/:timeframe/:interval/:dimensions/:metrics', function (req, res) {
    console.log(req.params);
  });
  
  //api routes
  app.get('/api/:resource/:action', auth.middleware, this.route);
  app.post('/api/:resource/:action', auth.middleware, this.route);
  app.get('/manage/:section/:subsection?', auth.middleware, function (req, res) {
    if (!req.session)
      req.session = {};

    if (!req.session['joolaio-token'])
      return res.redirect('/logout');

    var renderTarget;
    if (req.params.subsection)
      renderTarget = req.params.section + '/' + req.params.subsection;
    else
      renderTarget = req.params.section;

    res.render('manage/' + renderTarget, {user: req.user, token: req.token._});
  });
  app.get('/analytics/:section/:subsection?', auth.middleware, function (req, res) {
    if (!req.session)
      req.session = {};

    if (!req.session['joolaio-token'])
      return res.redirect('/logout');

    var renderTarget;
    if (req.params.subsection)
      renderTarget = req.params.section + '/' + req.params.subsection;
    else
      renderTarget = req.params.section;

    res.render(renderTarget, {user: req.user, token: req.token._});
  });
};
