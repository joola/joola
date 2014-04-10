/**
 *  @title joola.io/lib/common/auth
 *  @overview Provides authentication functionality across the framework.
 *  @description
 *  The `auth` module and middleware manages the entire flow relating to authentication, for example: login and token validation.
 *
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/

var
  joola = require('../joola.io'),
  crypto = require('crypto'),
  path = require('path'),
  url = require('url'),
  router = require('../webserver/routes/index');

var auth = exports;

/**
 * @member whitelist_extensions holds the list of whitelisted file extensions. These will be treated as static files and access to them will be allowed.
 */
auth.whitelist_extensions = [
  '.js',
  '.png'
];
/**
 * @member whitelist_endpoints holds the list of whitelisted endpoints. These will be allowed.
 */
auth.whitelist_endpoints = [
  '/login',
  '/api/users/authenticate'
];
/**
 * @member whitelist_params holds the list of whitelisted parameters that may be passed to the routing function. These will be allowed.
 */
auth.whitelist_params = [
  'resource',
  'action'
];

/**
 * @param {Object} err contains the exception details we need to wrap
 * Manipulates the object `this` to an Authentication Exception to be returned to the requestor.
 *
 */
function AuthErrorTemplate(err) {
  this.name = 'joola.io.engine Authentication Exception';
  this.code = 401;
  this.debug = process.env.NODE_ENV == 'test' ? (err && err.debug ? err.debug : null) : null;
  if (err.message) this.message = err.message; else this.message = err || '';
  if (err.stack) this.stack = err.stack; else this.stack = null;
}

AuthErrorTemplate.prototype = Error.prototype;
auth.AuthErrorTemplate = AuthErrorTemplate;

/**
 * @param {Object} token that we wish to extend.
 * @param {Function} callback called following execution with errors and results.
 * Extends a security token expiration.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains a {Object} with the extended token.
 */
auth.extendToken = function (req, token, callback) {
  if (!callback) {
    callback = token;
    token = req;
    req = null;
  }

  var timestamp = new Date();
  token.last = timestamp.getTime();
  token.expires = timestamp.setMilliseconds(timestamp.getMilliseconds() + joola.config.authentication.tokens.expireAfter || 20 * 60 * 1000 /*20 minutes*/);

  var expiration = parseInt((token.expires - token.last) / 1000, 10);
  joola.redis.expire('auth:tokens:' + token._, expiration, function (err, a) {
    if (err)
      joola.logger.warn({category: 'security', req: req}, '[auth] failed extending security token for [' + token.user.username + ']: ' + err);
    else
      joola.logger.trace({category: 'security', req: req}, '[auth] extended security token for [' + token.user.username + ']');
    return process.nextTick(function () {
      return callback(err, token);
    });
  });
};

/**
 * @param {Object} token that we wish to expire.
 * @param {Function} callback called following execution with errors and results.
 * Expires a security token.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 */
auth.expireToken = function (token, callback) {
  joola.redis.del('auth:tokens:' + token._, function (err) {
    return process.nextTick(function () {
      return callback(err);
    });
  });
};

/**
 * @param {Object} user that we wish to generate the token for.
 * @param {Function} callback called following execution with errors and results.
 * Generates a security token from the user's object.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains a {Object} with the newly generated token.
 */
auth.generateToken = function (req, user, callback) {
  if (!callback) {
    callback = user;
    user = req;
    req = null;
  }

  //check that we have a valid store that doesn't allow anonymous
  callback = callback || emptyfunc;
  var token = {};

  if (!user)
    return process.nextTick(function () {
      return callback(new Error('Missing user for token generation'));
    });

  var timestamp = new Date();

  //TODO: Make sure we have a valid user
  if (typeof user === 'string')
    user = JSON.parse(user);

  var UserProto = require('../dispatch/prototypes/user.js');
  console.log('verify');
  new UserProto(null, user.workspace, user, function (err, user) {
    console.log('verified', err, user);
    if (err)
      return callback(err);
    token.user = user;
    token._ = joola.common.uuid();
    token.timestamp = timestamp.getTime();
    token.last = timestamp.getTime();
    token.expires = timestamp.setMilliseconds(timestamp.getMilliseconds() + joola.config.authentication.tokens.expireAfter || 20 * 60 * 1000 /*20 minutes*/);

    token.user = JSON.stringify(token.user);

    joola.redis.hmset('auth:tokens:' + token._, token, function (err) {
      token.user = JSON.parse(token.user);
      joola.logger.trace({category: 'security', req: req}, '[auth] generated token [' + token._ + '] for [' + token.user.username + '].');
      auth.extendToken(token, function (err) {
        return process.nextTick(function () {
          if (typeof callback === 'function')
            return callback(err, token);
        });
      });
    });
  });
};

/**
 * @param {string} token is a string with the token to validate.
 * @param {Function} callback called following execution with errors and results.
 * Validates that the requested token exists.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains a {Object} with the validated Token.
 */
auth.validateToken = function (req, token, APIToken, callback) {
  if (!callback) {
    callback = APIToken;
    APIToken = token;
    token = req;
    req = null;
  }

  callback = callback || emptyfunc;
  if (!token && !APIToken)
    return process.nextTick(function () {
      return callback(new Error('Missing token for validation'));
    });

  if (APIToken) {
    joola.logger.trace({category: 'security', req: req}, 'Verifying API Token [' + APIToken + ']');
    joola.dispatch.users.verifyAPIToken(null, APIToken, function (err, user) {
      if (err)
        return process.nextTick(function () {
          return callback(err);
        });

      return auth.generateToken(user, callback);
    });
  }
  else {
    if (typeof token === 'object')
      token = token._;

    var cached = joola.memory.get(token);
    if (cached)
      return process.nextTick(function () {
        return callback(null, cached);
      });

    //check that we have a valid store that doesn't allow anonymous
    if (joola.config.authentication.store === 'anonymous') {
      var anonymousUser = {
        username: 'anonymous',
        _roles: ['user']
      };
      return auth.generateToken(anonymousUser, callback);
    }

    //check if we are using a bypass token
    if (token == joola.config.authentication.bypassToken) {
      var bypassUser = {
        username: 'bypass',
        _roles: ['root', 'user'],
        workspace: 'root'
      };
      joola.logger.trace({category: 'security', req: req}, 'Applying bypass token for request [1].');
      return auth.generateToken(bypassUser, callback);
    }

    //fetch the token
    joola.redis.hgetall('auth:tokens:' + token, function (err, _token) {
      if (_token) {
        //check that we have a valid token with a valid expiration
        //if (_token.user && _token.expires > new Date().getTime()) {
        //all is good
        _token.user = JSON.parse(_token.user);
        //extend the token
        joola.memory.set(_token._, _token);
        return auth.extendToken(req, _token, callback);
        /*}
         else {
         //someone is fucking around the system or there's a serious defect
         console.log(_token.expires , new Date().getTime())
         joola.logger.warn('Failed to validate token [2] [' + token + ']');
         return callback(new AuthErrorTemplate('Failed to validate token [2] [' + token + ']'));
         }*/
      }
      else
        return process.nextTick(function () {
          return callback(new AuthErrorTemplate('Failed to validate token [1] [' + token + ']'));
        });
    });
  }
};

/**
 * @param {string} modulename is the name of the module to load.
 * @param {string} action is the name of the action to run.
 * @param {Function} callback called following execution with errors and results.
 * Validates that the requested route exists and yields a valid action.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains a {Object} with the action from the route.
 */
auth.validateRoute = function (req, modulename, action, callback) {
  if (!callback) {
    callback = action;
    action = modulename;
    modulename = req;
  }

  var module;

  if (!modulename)
    return process.nextTick(function () {
      return callback(new Error('Module not specified.'));
    });

  try {
    module = require('../dispatch/' + modulename);
  }
  catch (ex) {
    joola.logger.trace({category: 'security', req: req}, 'Failed to validate route for [' + modulename + '][' + action + ']');
    return process.nextTick(function () {
      return callback(ex);
    });
  }

  if (!action)
    action = 'index';

  try {
    var _action = module[action];
    joola.logger.trace({category: 'security', req: req}, 'Validated route for [' + modulename + '][' + action + ']');

    if (!_action)
      return process.nextTick(function () {
        return callback(new Error('Failed to validate route for [' + modulename + '][' + action + ']'));
      });

    return process.nextTick(function () {
      return callback(null, _action);
    });
  }
  catch (err) {
    return process.nextTick(function () {
      return callback(err);
    });
  }
};

/**
 * @param {Object} action contain the `action` we wish to validate.
 * @param {Object} req holds the http request.
 * @param {Object} res holds the http response.
 * @param {Function} callback called following execution with errors and results.
 * Validates the request has required parameters and that the user has permission to access the `action`.
 * The `action` parameter holds an endpoint, for example `joola.dispatch.datasources.list`. The endpoint includes a list
 * of allowed parameters and the actual list sent `req.params` is inspected. If a parameter exists in `req.params`, but not
 * in the allow list, it is ignored and not passed along to the `action`.
 * The next step is to validate permissions, for that the user is retrieved from `req.user` which was set earlier by `validateToken`.
 * The endpoint holds a list of allowed `roles` and the existing user roles is compared against it.
 * If all conditions are met, then the function calls a callback with a `true` result.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains a {boolean} indicating if the action is validated.
 *
 * Configuration elements participating: `config:authentication`.
 *
 * ```js
 * var action = joola.dispatch.datasources.list;
 * //req is an http request with a valid token
 * joola.auth.validateAction(action, req, res, function(err, bValidToken) {
 *   console.log(err, bValidToken);
 * }
 * ```
 */
auth.validateAction = function (action, req, res, callback) {
  if (req.method == 'OPTIONS')
    return process.nextTick(function () {
      return callback(null, true);
    });

  var required, optional;
  if (action.inputs.required) {
    required = action.inputs.required;
    optional = action.inputs.optional;
  }
  else
    required = action.inputs;

  req.params = joola.common.extend(req.params, req.query);

  var _params = [];
  var paramMissing = false;

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

  var missing = [];
  required.forEach(function (param) {
    if (!req.params[param]) {
      paramMissing = true;
      missing.push(param);
    }
    else if (auth.whitelist_params.indexOf(param) == -1) {
      _params[param] = req.params[param];
    }
    else {
      //_params[param] = req.params[param];
    }
  });
  if (paramMissing)
    return process.nextTick(function () {
      return callback(new auth.AuthErrorTemplate('Required param is missing [' + missing.join(',') + '].'), false);
    });

  if (optional) {
    optional.forEach(function (param) {
      if (req.params[param])
        _params[param] = req.params[param];
    });
  }
  Object.keys(req.params).forEach(function (param) {
    if (auth.whitelist_params.indexOf(param) > -1) {
      _params[param] = req.params[param];
    }
  });
  req.params = _params;

  if (!req.user)
    return process.nextTick(function () {
      return callback(new auth.AuthErrorTemplate('Request for action by unauthenticated user.'), false);
    });

  if (typeof req.user === 'string')
    req.user = JSON.parse(req.user);
  var userPermissions = [];
  if (req.user._roles) {
    joola.workspaces.get({user: req.user}, req.user.workspace, function (err, workspace) {
      if (err) {
        joola.logger.warn({category: 'security', req: req}, 'Missing role [' + req.user._roles.join(',') + '] for user ' + req.user.username + ', with workspace [' + req.user.workspace + ']');
        return process.nextTick(function () {
          return callback(new auth.AuthErrorTemplate('Missing permission to run this action. [action:' + action.name + '][permission:' + action._permission + '][roles:' + JSON.stringify(req.user._roles) + ', permissions: workspace missing: ' + err + ']'), false);
        });
      }

      req.user._roles.forEach(function (role) {
        Object.keys(workspace.roles).forEach(function (roleToCompareAgainst) {
          if (role === roleToCompareAgainst) {
            userPermissions = userPermissions.concat(workspace.roles[roleToCompareAgainst]._permissions);
          }
        });
      });
      var hasPermission = false;
      action._permission.forEach(function (permission) {
        if (userPermissions.indexOf(permission) > -1)
          hasPermission = true;
      });

      if (!hasPermission) {
        return process.nextTick(function () {
          return callback(new auth.AuthErrorTemplate('Missing permission to run this action. [action:' + action.name + '][permission:' + action._permission + '][roles:' + JSON.stringify(req.user._roles) + ', permissions: ' + userPermissions.join(',') + ']'), false);
        });
      }

      return process.nextTick(function () {
        return callback(null, true);
      });
    });
  }
  else
    return process.nextTick(function () {
      return callback(new auth.AuthErrorTemplate('Missing permission to run this action. [action:' + action.name + '][permission:' + action._permission + '][roles:' + JSON.stringify(req.user._roles) + ', permissions: no roles for user]'), false);
    });

};

/**
 * @param {Object} req holds the http request.
 * @param {Object} res holds the http response.
 * @param {Function} next called upon completion.
 * The actual middleware function that handles every incoming request for non-static resources and actions.
 * The main logic flow is:
 *  - Check if action/resource is whitelisted
 *  - Try to locate a token for this request, if none show login/401
 *  - Validate the token
 *  - Validate the route
 *  - If all is well, run the request
 *
 * The function calls on completion an optional `next` with:
 * - `err` if occured, an error object, else null.
 *
 * Configuration elements participating: `config:authentication`.
 *
 * Events raised via `dispatch`: `auth:login-request`, `auth:login-success`, `auth:login-fail`
 */
auth.middleware = function (req, res, next) {
  var debug = {};
  var parts = url.parse(req.url);

  if (req.method === 'POST') {
    var obj;
    try {
      obj = Object.keys(req.body)[0];
      obj = JSON.parse(obj);
    }
    catch (ex) {
      if (req && req.body)
        obj = req.body;
    }
    if (typeof obj !== 'object')
      obj = {};

    Object.keys(obj).forEach(function (key) {
      var value = obj[key];
      req.params[key] = value;
    });
  }

  //if (!req.session)
//    req.session = {};

//allow static content to pass
  if (auth.whitelist_extensions.indexOf(path.extname(parts.pathname)) > -1 && parts.pathname !== '/joola.io.js') {
    //joola.stats.incr('auth:whitelist:extensions');
    return next();
  }

  joola.logger.trace({category: 'security', req: req}, 'Authentication request [' + parts.pathname + ']');
//allow white-listed endpoints to pass through, for example /login
  if (auth.whitelist_endpoints.indexOf(parts.pathname) > -1 || auth.whitelist_endpoints.indexOf('/' + parts.pathname) > -1) {
    //joola.stats.incr('auth:whitelist:endpoints');
    return next();
  }

//check if we have a valid token as part of the request
//check query string for `token`
  var token = req.query.token;
  var APIToken = req.query.APIToken || req.headers['joolaio-apitoken'];

  debug.query_token = token;
//check query string for `token`
  if (!token && req.headers) {
    token = req.headers['joolaio-token'];
    debug.header_token = token;
  }
//check session for `token`
//  if (!token && req.session) {
//    token = req.session['joolaio-token'];
//    debug.session_token = token;
//  }
  if (!token && !APIToken && parts.pathname != '/logout') {
    //we have no token, redirect the page to login
    var err = new AuthErrorTemplate('Failed to locate valid token for the request');
    err.debug = debug;
    return router.responseError(err, req, res);
    //throw new AuthErrorTemplate(err);
  }
  else if (parts.pathname == '/logout')
    return next();

//We have a token, let's validate
  exports.validateToken(req, token, APIToken, function (err, _token) {
    if (_token) {
      //joola.stats.incr('auth:tokens:validated');
      joola.logger.trace({category: 'security', req: req}, 'Token [' + _token._ + '] is valid for user [' + _token.user.username + '].');
    }
    else {
      //joola.stats.incr('auth:tokens:invalid');
      //we have invalid token, throw an exception
      joola.logger.debug({category: 'security', req: req}, 'Token [' + _token + '] is invalid.');
      err = new AuthErrorTemplate(err);
      err.debug = debug;
      return router.responseError(err, req, res);
    }

    req.token = _token;
    req.user = _token.user;

    //we need to validate the route.
    // we check that the user has permissions to run the action.

    var modulename = req.params.resource;
    var action = req.params.action;

    if (modulename && action) {
      exports.validateRoute(req, modulename, action, function (err, action) {
        if (err)
          return router.responseError(err, req, res);

        exports.validateAction(action, req, res, function (err, valid) {
          if (err) {
            err = new AuthErrorTemplate(err);
            err.debug = debug;
            return router.responseError(err, req, res);
          }

          if (valid) {
            //joola.stats.incr('auth:middleware_validated');
            return next();
          }
          else {
            //joola.stats.incr('auth:middleware_invalid');
            err = new AuthErrorTemplate(new Error('Failed to validate request'));
            err.debug = debug;
            return router.responseError(err, req, res);
          }
        });
      });
    }
    else {
      return next();
    }
  });
}
;

/**
 * @function hashPassword
 * @param {string} plainPassword contains a simple text, plain password for hashing
 * @param {string} [salt] the salt to use for hashing
 * @return {string} hashed password with the hash.
 * Hashes a plain text password using MD5.
 * - `plainPassword` is the plain password to hash
 *
 * The function returns on completion a hashed string.
 *
 * ```js
 * var plainPassword = 'password'
 * var hashed = joola.dispatch.users.hashPassword(plainPassword);
 * console.log(plainPassword, hashed);
 * ```
 */
auth.hashPassword = function (plainPassword, salt) {
  if (!plainPassword)
    return null;
  try {
    if (!salt)
      salt = joola.common.uuid();
    var hash = crypto.createHash('md5').update(plainPassword.toString()).digest('hex');
    return salt + '$' + hash;
  }
  catch (ex) {
    joola.logger.warn('Failed to hash password [' + plainPassword + ']: ' + ex.message);
    return null;
  }
};

/**
 * @function validatePassword
 * @param {string} plainPassword contains a simple text, plain password for hashing
 * @param {string} hash contains a hashed string for comparison
 * @return {bool} true if match.
 * Validates that a hash and plain password match
 * - `plainPassword` is the plain password to hash
 * - `hash` is the hashed password to verify
 *
 * The function returns on completion a bool indicating if the password and hash match.
 *
 * ```js
 * var plainPassword = 'password'
 * var hash = 'hashedPassword'
 * var match = joola.dispatch.users.validatePassword(plainPassword, hash);
 * console.log(match);
 * ```
 */
auth.validatePassword = function (plainPassword, hash) {
  if (!plainPassword || !hash)
    return false;
  try {
    var salt = hash.substring(0, hash.indexOf('$'));
    var comparison = auth.hashPassword(plainPassword, salt);
    return comparison == hash;
  }
  catch (ex) {
    joola.logger.warn('Failed to hash password [' + plainPassword + ']: ' + ex.message);
    return false;
  }
};

/**
 * @function getUserByToken
 * @param {string} token contains the token to translate into user
 * @param {Function} callback called following execution with errors and results.
 * Validates that a hash and plain password match
 * - `token` contains the token to translate into user
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains a {boolean} indicating if the action is validated.
 *
 * The function returns on completion the user object assosciated with the provided token.
 *
 * ```js
 * var token = '12345';
 * joola.dispatch.users.getUserByToken(token, function(err, user){
 *   console.log(user);
 * });
 * ```
 */
auth.getUserByToken = function (token, callback) {
  callback = callback || emptyfunc;
  if (!token)
    return process.nextTick(function () {
      return callback(new Error('Token not provided)'));
    });

  //check if we are using a bypass token
  if (token == joola.config.authentication.bypassToken) {
    var bypassUser = {
      username: 'bypass',
      workspace: 'root',
      _roles: ['root', 'user']
    };
    joola.logger.trace({category: 'security'}, 'Applying bypass token for request [2].');
    return process.nextTick(function () {
      return callback(null, bypassUser);
    });
  }

  joola.redis.hgetall('auth:tokens:' + token, function (err, _token) {
    if (err)
      return process.nextTick(function () {
        return callback(err);
      });
    if (!_token)
      return process.nextTick(function () {
        return callback(new Error('Token not found'));
      });
    if (!_token.user)
      return process.nextTick(function () {
        return callback(new Error('Failed to translate user from token'));
      });
    try {
      _token.user = JSON.parse(_token.user);
    }
    catch (ex) {
      return process.nextTick(function () {
        return callback(ex);
      });
    }

    return process.nextTick(function () {
      return callback(null, _token.user);
    });
  });
};

/**
 * @function login
 * @param {string} username contains the username
 * @param {string} password contains the password
 * @param {Function} callback called following execution with errors and results.
 * Validates that a hash and plain password match
 * - `username` contains the username
 * - `password` contains the password
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains a {Object} with the user or null in case of invalid username/password
 *
 * The function returns on completion the user object assosciated with the login credentials.
 *
 * ```js
 * var username = 'demo';
 * var password = 'password';
 * joola.auth.login(username, password, function(err, user){
 *   console.log(user);
 * });
 * ```
 */
auth.login = function (username, password, callback) {

};