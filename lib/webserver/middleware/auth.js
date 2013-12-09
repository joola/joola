/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

var
  path = require('path'),
  url = require('url');

var whitelist_extensions = ['.js', '.png'];
var whitelist_endpoints = ['/login'];
var bypassToken = '123';

function AuthErrorTemplate(err) {
  this.name = 'joola.io.engine Authentication Exception';
  this.code = 401;
  if (err.message) this.message = err.message; else this.message = err || '';
  if (err.stack) this.stack = err.stack; else this.stack = null;
}

AuthErrorTemplate.prototype = Error.prototype;
exports.AuthErrorTemplate = AuthErrorTemplate;

exports.validateToken = function (token, callback) {
  if (token == bypassToken)
    return callback(null, true);

  return callback(new Error('Failed to validate token [' + token + ']'));
};

exports.validateRoute = function (req, res, callback) {
  var modulename = req.param.resource;
  var action = req.param.action;
  var module;

  if (!modulename)
    return callback(new Error('Module not specified.'));

  try {
    module = require('../routes/api/' + modulename);
  }
  catch (ex) {
    console.log('err', ex);
    console.log(ex.stack);
    return callback(ex);
  }

  if (!action)
    action = 'index';

  try {
    action = module[action];




  }
  catch (err) {
    return callback(err);
  }
};


//we have a valid token, let's make sure the action is authorized
exports.validateAction = function (action, req, res, callback) {
  if (req.method == 'OPTIONS')
    return callback(null, true);

  var required = action.inputs.required;
  var optional = action.inputs.optional;

  var _params = [];
  _params.resource = req.params.resource;
  _params.action = req.params.action;
  _params.minres = req.params.minres;

  required.forEach(function (param) {
    if (!req.params[param])
      return callback(new ErrorTemplate('Required param [' + param + '] is missing.'), false);
    _params[param ] = req.params[param];
  });

  optional.forEach(function (param) {
    if (req.params[param])
      _params[param] = req.params[param];
    else
      _params[param] = '';
  });

  req.debug = {};
  Object.keys(_params).forEach(function (key) {
    req.debug[key] = _params[key];
  });

  req.params = _params;

  if (!req.user)
    return callback(new ErrorTemplate('Request for action by unauthenticated user.'), false);

  var userPermissions = [];
  req.user._roles.forEach(function (role) {
    joola.config.auth.roles.forEach(function (roleToCompareAgainst) {
      if (role === roleToCompareAgainst.id) {
        userPermissions = userPermissions.concat(roleToCompareAgainst.permissions);
      }
    });
  });

  if (util.isArray(action.permission))
    action.permission = action.permission[0];
  if (userPermissions.indexOf(action.permission) == -1)
    return callback(new ErrorTemplate('Missing permission to run this action. [action:' + action.name + '][permission:' + action.permission + '][roles:' + JSON.stringify(req.user._roles) + ']'), false);

  return callback(null, true);
};


// the middleware function
exports.auth = function (req, res, next) {
  var parts = url.parse(req.url);

  return next();
  /*
  if (whitelist_extensions.indexOf(path.extname(parts.pathname)) > -1)
    return next();

  joola.logger.silly('Authentication request [' + parts.pathname + ']');
  if (whitelist_endpoints.indexOf(parts.pathname) > -1)
    return next();

  //check if we have a valid token as part of the request
  var token = req.query.token;
  if (!token)
    token = req.headers['joolaio-token'];

  if (!token)
    return res.redirect('/login?redirect=' + encodeURIComponent(req.url));

  //We have a token, let's validate
  exports.validateToken(token, function (err, valid) {
    if (valid)
      joola.logger.silly('Token [' + token + '] is valid.');
    else {
      joola.logger.info('Token [' + token + '] is invalid.');
      throw new AuthErrorTemplate(err);
    }

    exports.validateRoute(req,res,function(err,valid){

    });


  });
  */
};