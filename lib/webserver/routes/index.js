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
  if (err.code && err.code == 401) {
    res.status(401);

    var parts = url.parse(req.url);
    if (req.query)
      return res.redirect('/login?redirect=' + parts.pathname + (parts.query ? encodeURIComponent(parts.search) : ''));
    else
      return res.redirect('/login');
  }
  else if (err.code && err.code == 'MODULE_NOT_FOUND')
    res.status(404);
  else
    res.status(500);

  res.json(err);
  res.handled = true;
};

exports.responseSuccess = function (data, req, res) {
  var response = {};

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
  res.redirect('/analytics/index?' + querystring.stringify(req.query));
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
  if (joola.state.get().status != 'online') {
    if (res.render)
      return res.render('server-offline');
    else
      return res.json('server-offline');
  }

  var modulename = req.params.resource;
  var module;
  var action = req.params.action;

  if (!req.token && modulename != 'test')
    return exports.responseError(new ErrorTemplate('Missing token.'), req, res);

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

  try {
    action = module[action];

    if (req.params[0] instanceof Object)
      req.params = req.params[0];

    Object.keys(req.params).forEach(function (key) {
      try {
        req.params[key] = JSON.parse(req.params[key]);
      }
      catch (ex) {
        //ignore
      }
    });
    joola.logger.silly('Routing [' + action.name + ']...');
    return action.route(req, res);
  }
  catch (ex) {
    return exports.responseError(new ErrorTemplate(ex), req, res);
  }
};

exports.sdk = function (req, res) {
  var jsContent;
  var filename = path.join(__dirname, '../../sdk/bin/', 'joola.io.js');
  fs.readFile(filename, function read(err, data) {
    if (err) {
      //TODO: we cannot do throw, use callbacks.
      throw err;
    }
    jsContent = data;
    jsContent += '\n' + 'joolaio.TOKEN = \'' + req.token._ + '\'';
    res.setHeader('joola-token', req.token._);
    res.setHeader('Content-Type', 'text/javascript');
    res.setHeader('Content-Length', jsContent.length);
    //res.setHeader('Last-Modified', result.timestamp);
    res.setHeader('Cache-Control', 'public, max-age=31557600');

    return res.send(jsContent);
  });
};

exports.generateerror = function (req, res) {
  throw new Error('Error for testing');
};

exports.login = function (req, res) {
  if (req.method == 'POST') {
    if (!req.body.email || !req.body.password)
      return res.render('login', {title: 'joola.io - Login', error: 'Username/password required'});

    joola.dispatch.users.authenticate(req.body.email, req.body.password, function (err, user) {
      if (err)
        return res.render('login', {title: 'joola.io - Login', error: err});
      joola.auth.generateToken(user, function (err, token) {
        if (err)
          return res.render('login', {title: 'joola.io - Login', error: err});

        req.session['joolaio-token'] = token._;

        if (req.body.redirect && req.body.redirect != '/logout') {
          var redirectTarget = req.body.redirect + (req.body.redirect.indexOf('?') > -1 ? '&' : '?') + 'token=' + token._;
          return res.redirect(redirectTarget);
        }
        else
          return res.redirect('/?token=' + token._);
      });
    });
  }
  else
    return res.render('login', {title: 'joola.io - Login', redirect: req.query.redirect ? req.query.redirect : ''});
};

exports.logout = function (req, res) {
  if (req.token) {
    joola.auth.expireToken(req.token, function () {
      delete req.session['joolaio-token'];
      delete req.session['user'];
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

  //sdk
  app.get('/joola.io.js', auth.middleware, this.sdk);

  //api routes
  app.get('/api/:resource/:action', auth.middleware, this.route);
  app.get('/manage/:section/:subsection?', auth.middleware, function (req, res) {
    if (!req.session['joolaio-token'])
      return res.redirect('/logout');

    var renderTarget;
    if (req.params.subsection)
      renderTarget = req.params.section + '/' + req.params.subsection;
    else
      renderTarget = req.params.section;

    res.render(renderTarget, {user: req.user, token: req.token._});
  });
  app.get('/analytics/:section/:subsection?', auth.middleware, function (req, res) {
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
