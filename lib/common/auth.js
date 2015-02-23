/**
 *  @title joola/lib/common/auth
 *  @overview Provides authentication functionality across the framework.
 *  @description
 *  The `auth` module and middleware manages the entire flow relating to authentication, for example: login and token validation.
 *
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/

'use strict';

var
  joola = require('../joola.js'),
  crypto = require('crypto'),
  path = require('path'),
  url = require('url'),
  ce = require('cloneextend'),
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
  this.code = 401;
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

  /* istanbul ignore if */
  if (token && !token._)
    return callback(new Error('Missing token'));

  var timestamp = new Date();
  token.last = timestamp.getTime();
  token.expires = timestamp.setMilliseconds(timestamp.getMilliseconds() + (joola.config.get('authentication:tokens:expireafter') || 20 * 60 * 1000 /*20 minutes*/));

  var expiration = (joola.config.get('authentication:tokens:expireafter') || 20 * 60 * 1000 /*20 minutes*/) / 1000;
  /* istanbul ignore else */
  if (joola.redis) {
    joola.redis.expire(joola.config.namespace + ':auth:tokens:' + token._, expiration, function (err, a) {
      /* istanbul ignore if */
      if (err)
        joola.logger.warn({category: 'security'}, '[auth] failed extending security token for [' + token.user.username + ']: ' + err);
      else
        joola.logger.trace({category: 'security'}, '[auth] extended security token for [' + token.user.username + ']');
      return process.nextTick(function () {
        return callback(err, token);
      });
    });
  }
  else {
    joola.memory.set('token:' + token._, joola.memory.get('token:' + token._), expiration * 1000);
    joola.logger.trace({category: 'security'}, '[auth] extended security token for [' + token.user.username + ']');
    return process.nextTick(function () {
      return callback(null, token);
    });
  }
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
  /* istanbul ignore else */
  if (joola.redis) {
    joola.memory.set('token:' + token._, null);
    joola.redis.del(joola.config.namespace + ':auth:tokens:' + token._, function (err) {
      return process.nextTick(function () {
        return callback(err);
      });
    });
  } else {
    joola.memory.set('token:' + token._, null);
    return process.nextTick(function () {
      return callback(null);
    });
  }
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
  /* istanbul ignore if */
  if (!callback) {
    callback = user;
    user = req;
    req = null;
  }

  //check that we have a valid store that doesn't allow anonymous
  callback = callback || function () {
  };
  var token = {};

  if (!user)
    return process.nextTick(function () {
      return callback(new Error('Missing user for token generation'));
    });

  var timestamp = new Date();

  //TODO: Make sure we have a valid user
  if (typeof user === 'string')
    try {
      user = JSON.parse(user);
    } catch (ex) {
      return callback(new Error('Invalid user for token generation'));
    }

  var UserProto = require('../dispatch/prototypes/user.js');
  new UserProto({user: joola.SYSTEM_USER}, user.workspace, user, function (err, user) {
    /* istanbul ignore if */
    if (err)
      return callback(err);
    token.user = ce.clone(user);
    delete token.user.token;
    token._ = joola.common.uuid();
    token.token = token._;
    token.timestamp = timestamp.getTime();
    token.last = timestamp.getTime();
    token.expires = timestamp.setMilliseconds(timestamp.getMilliseconds() + (joola.config.get('authentication:tokens:expireafter') || 20 * 60 * 1000 /*20 minutes*/));

    token.user = JSON.stringify(token.user);

    /* istanbul ignore else */
    if (joola.redis) {
      return joola.redis.hmset(joola.config.namespace + ':auth:tokens:' + token._, token, function (err) {
        joola.memory.set('token:' + token._, token, (joola.config.get('authentication:tokens:expireafter') || 20 * 60 * 1000 /*20 minutes*/));
        token.user = JSON.parse(token.user);
        joola.logger.trace({category: 'security'}, '[auth] generated token [' + token._ + '] for [' + token.user.username + '].');
        auth.extendToken(token, function (err) {
          return process.nextTick(function () {
            if (typeof callback === 'function')
              return callback(err, ce.clone(token));
          });
        });
      });
    }
    else {
      joola.memory.set('token:' + token._, token, (joola.config.get('authentication:tokens:expireafter') || 20 * 60 * 1000 /*20 minutes*/));
      token.user = JSON.parse(token.user);
      joola.logger.trace({category: 'security'}, '[auth] generated token [' + token._ + '] for [' + token.user.username + '].');
      auth.extendToken(token, function (err) {
        return process.nextTick(function () {

          if (typeof callback === 'function')
            return callback(err, ce.clone(token));
        });
      });

    }
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

  callback = callback || function () {
  };
  if (!token && !APIToken)
    return process.nextTick(function () {
      return callback(new Error('Missing token for validation'));
    });
  if (APIToken) {
    var cachedUser = joola.memory.get('APIToken:' + APIToken);
    if (cachedUser) {
      cachedUser.cached = true;
      return callback(null, cachedUser);
    }

    joola.logger.trace({category: 'security'}, 'Verifying API Token [' + APIToken + ']');
    joola.dispatch.users.verifyAPIToken({user: joola.SYSTEM_USER}, APIToken, function (err, user) {
      /* istanbul ignore if */
      if (err)
        return process.nextTick(function () {
          return callback(err);
        });
      //return auth.generateToken(user, callback);
      joola.memory.set('APIToken:' + APIToken, user, (joola.config.get('authentication:tokens:expireafter') || 20 * 60 * 1000 /*20 minutes*/));
      return callback(null, user);
    });
  }
  else {
    if (typeof token === 'object')
      token = token._;

    var cached = joola.memory.get('token:' + token);
    if (cached) {
      cached.cached = true;
      return process.nextTick(function () {
        return callback(null, cached);
      });
    }

    //check that we have a valid store that doesn't allow anonymous
    /* istanbul ignore if */
    if (joola.config.get('authentication:store') === 'anonymous') {
      var anonymousUser = {
        username: 'anonymous',
        roles: ['user']
      };
      return auth.generateToken(anonymousUser, callback);
    }

    //fetch the token
    /* istanbul ignore else */
    if (joola.redis) {
      joola.redis.hgetall(joola.config.namespace + ':auth:tokens:' + token, function (err, _token) {
        if (_token) {
          //all is good
          _token.user = JSON.parse(_token.user);
          //extend the token
          joola.memory.set('token:' + _token._, _token, (joola.config.get('authentication:tokens:expireafter') || 20 * 60 * 1000 /*20 minutes*/));
          return auth.extendToken(req, _token, callback);
        }
        else
          return process.nextTick(function () {
            return callback(new AuthErrorTemplate('Failed to validate token [1] [' + token + ']'));
          });
      });
    }
    else {
      var _token = joola.memory.get('token:' + token);
      if (_token) {
        //extend the token
        joola.memory.set('token:' + _token._, _token, (joola.config.get('authentication:tokens:expireafter') || 20 * 60 * 1000 /*20 minutes*/));
        return auth.extendToken(req, _token, callback);
      }
      else
        return process.nextTick(function () {
          return callback(new AuthErrorTemplate('Failed to validate token [2] [' + token + ']'));
        });

    }
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


  var cached = joola.memory.get('validateRoute:' + modulename + ':' + action);
  if (cached)
    return callback(null, cached);

  var module;

  if (!modulename)
    return process.nextTick(function () {
      return callback({code: 404, message: 'Not Found'});
    });

  try {
    module = require('../dispatch/' + modulename);
  }
  catch (ex) {
    joola.logger.trace({category: 'security'}, 'Failed to validate route for [' + modulename + '][' + action + ']');
    return process.nextTick(function () {
      return callback(ex);
    });
  }

  if (!action)
    action = 'index';

  try {
    var _action = module[action];
    joola.logger.trace({category: 'security'}, 'Validated module for [' + modulename + '][' + action + ']');

    if (!_action)
      return process.nextTick(function () {
        return callback({code: 404, message: 'Not Found'});
      });

    joola.memory.set('validateRoute:' + modulename + ':' + action, _action);
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

  if (!req.user)
    return process.nextTick(function () {
      return callback(new auth.AuthErrorTemplate('Request for action by unauthenticated user.'), false);
    });
  if (typeof req.user === 'string')
    req.user = JSON.parse(req.user);

  var cached = joola.memory.get('validateAction:' + action.name + ':' + req.user.username);
  if (cached)
    return callback(null, true);

  var userPermissions = [];
  if (req.user.roles) {
    joola.workspaces.get({user: req.user}, req.user.workspace, function (err, workspace) {
      /* istanbul ignore if */
      if (err) {
        joola.logger.warn({category: 'security'}, 'Missing role [' + req.user.roles.join(',') + '] for user ' + req.user.username + ', with workspace [' + req.user.workspace + ']');
        return process.nextTick(function () {
          return callback(new auth.AuthErrorTemplate('Missing permission to run this action. [action:' + action.name + '][permission:' + action._permission + '][roles:' + JSON.stringify(req.user.roles) + ', permissions: workspace missing: ' + err + ']'), false);
        });
      }
      if (!Array.isArray(req.user.roles))
        req.user.roles = [req.user.roles];
      req.user.roles.forEach(function (role) {
        Object.keys(workspace.roles).forEach(function (roleToCompareAgainst) {
          if (role === roleToCompareAgainst) {
            userPermissions = userPermissions.concat(workspace.roles[roleToCompareAgainst].permissions);
          }
        });
      });
      var hasPermission = false;
      if (!Array.isArray(userPermissions))
        userPermissions = [userPermissions];

      action._permission.forEach(function (permission) {
        if (userPermissions.indexOf(permission) > -1) {
          hasPermission = true;
        }
      });

      if (!hasPermission && action._permission != 'guest') {
        return process.nextTick(function () {
          return callback(new auth.AuthErrorTemplate('Missing permission to run this action. [action:' + action.name + '][permission:' + action._permission + '][roles:' + JSON.stringify(req.user.roles) + ', permissions: ' + userPermissions.join(',') + ']'), false);
        });
      }

      if (action._permission === 'guest')
        req.guestAllowedAction = true;

      req.user.permissions = userPermissions;
      joola.memory.set('validateAction:' + action.name + ':' + req.user.username, true);
      return process.nextTick(function () {
        return callback(null, true);
      });
    });
  }
  else
    return process.nextTick(function () {
      return callback(new auth.AuthErrorTemplate('Missing permission to run this action. [action:' + action.name + '][permission:' + action._permission + '][roles:' + JSON.stringify(req.user.roles) + ', permissions: no roles for user]'), false);
    });

};

auth.checkRateLimits = function (req, res, callback) {
  var limitKey;
  if (!req.user) {
    limitKey = req.connection.remoteAddress;
    req.limits = {
      limit: joola.config.get('authentication:ratelimits:guest'), //TODO: Set default from config
      remaining: 0,
      reset: 0
    };
  }
  else {
    limitKey = req.user.workspace + ':' + req.user.username;
    if (!req.user.hasOwnProperty('ratelimit'))
      req.user.ratelimit = parseInt(joola.config.get('authentication:ratelimits:user'));
    else
      req.user.ratelimit = parseInt(req.user.ratelimit);
    //no rate limit applied
    if (req.user.ratelimit === 0)
      return callback(null);

    req.limits = {
      limit: req.user.ratelimit,
      remaining: 0,
      reset: 0
    };
  }
  var redisKey = joola.config.namespace + ':ratelimits:' + limitKey;
  /* istanbul ignore else */
  if (joola.redis) {
    joola.redis.incr(redisKey, function (err, result) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      if (result === 1)
        joola.redis.pexpire(redisKey, 60 * 60 * 1000);

      req.limits.remaining = req.limits.limit - result;

      joola.redis.pttl(redisKey, function (err, ttl) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        req.limits.reset = Math.floor((new Date().getTime() + ttl ) / 1000);
        res.header("X-RateLimit-Limit", req.limits.limit);
        res.header("X-RateLimit-Remaining", req.limits.remaining < 0 ? 0 : req.limits.remaining);
        res.header("X-RateLimit-Reset", req.limits.reset);
        res.header("Retry-After", Math.floor(ttl / 1000));

        if (req.limits.remaining < 0)
          return callback(new Error('Limit exceeded'));

        return callback(null);
      });
    });
  }
  else {
    joola.memory.set(redisKey, parseInt(joola.memory.get(redisKey)) + 1);
    var counter = joola.memory.get(redisKey);
    if (counter === 1)
      joola.memory.set(redisKey, counter, 60 * 60 * 1000);

    //req.limits.remaining = req.limits.limit - result;
    //req.limits.reset = Math.floor((new Date().getTime() + ttl ) / 1000);
    res.header("X-RateLimit-Limit", req.limits.limit);
    res.header("X-RateLimit-Remaining", req.limits.remaining < 0 ? 0 : req.limits.remaining);
    res.header("X-RateLimit-Reset", 0);
    res.header("Retry-After", 0);

    if (req.limits.remaining < 0)
      return callback(new Error('Limit exceeded'));

    return callback(null);
  }
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

  //TODO: Add header to SDK
  //if (req.headers['content-type'] !== 'application/json' && (req.method !== 'GET' && req.method !== 'OPTIONS'))
  //  return router.responseError(415, new Error('Unsupported Media Type'), req, res);

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

  //allow static content to pass
  if (auth.whitelist_extensions.indexOf(path.extname(parts.pathname)) > -1 && parts.pathname !== '/joola.js') {
    return next();
  }

  joola.logger.trace({category: 'security'}, 'Authentication request [' + parts.pathname + ']');
  //allow white-listed endpoints to pass through, for example /login
  if (auth.whitelist_endpoints.indexOf(parts.pathname) > -1 || auth.whitelist_endpoints.indexOf('/' + parts.pathname) > -1) {
    return next();
  }

  //check if we have a valid token as part of the request
  //check query string for `token`
  var token = req.query.token;
  var APIToken = req.query.APIToken || req.headers['joola-apitoken'];

  //check query string for `token`
  if (!token && req.headers) {
    token = req.headers['joola-token'];
  }

  if (req.headers && req.headers.authorization) {
    var header = req.headers.authorization || '',        // get the header
      authType = header.split(/\s+/)[0],
      headerToken = header.split(/\s+/).pop() || '',            // and the encoded auth token
      headerAuth = new Buffer(headerToken, 'base64').toString(),    // convert from base64
      authParts = headerAuth.split(/:/),                          // split on colon
      workspace = authParts[0].split('/')[0],
      username = authParts[0].split('/')[1],
      password = authParts[1];

    if (authType.toLowerCase() === 'basic') {
      var context = {
        user: {
          username: 'bypass',
          workspace: workspace
        }
      };
      return joola.users.authenticate(context, workspace, username, password, function (err, user) {
        /* istanbul ignore if */
        if (err)
          return router.responseError(404, err, req, res);

        return auth.generateToken(user.user, function (err, _token) {
          /* istanbul ignore if */
          if (err)
            return router.responseError(404, err, req, res);

          req.headers.authorization = 'token ' + _token._;
          return auth.middleware(req, res, next);
        });
      });

    }
    else if (authType.toLowerCase() === 'token') {
      APIToken = headerToken;
    }
  }
  var modulename = req.endpointRoute.module;
  var action = req.endpointRoute.action;

  //We have a token, let's validate
  exports.validateToken(req, token, APIToken, function (err, _token) {
    if (_token && _token._) {
      //joola.stats.incr('auth:tokens:validated');
      joola.logger.trace({category: 'security'}, 'Token [' + _token._ + '] is valid for user [' + _token.user.username + '].');
      req.token = _token;
      req.user = _token.user;
    }
    else if (_token && APIToken) {
      joola.logger.trace({category: 'security'}, 'Token [' + APIToken + '] is valid for user [' + _token.username + '].');
      req.token = APIToken;
      req.user = _token;
    }

    //rate limits
    exports.checkRateLimits(req, res, function (err) {
      /* istanbul ignore if */
      if (err) {
        err.help_url = 'http://github.com/joola/joola/wiki/rate-limits';
        return router.responseError(429, err, req, res);
      }

      //we need to validate the route.
      // we check that the user has permissions to run the action.
      if (modulename && action) {
        exports.validateRoute(req, modulename, action, function (err, action) {
          /* istanbul ignore if */
          if (err)
            return router.responseError(err.code || 401, err, req, res);

          exports.validateAction(action, req, res, function (err, valid) {
            /* istanbul ignore if */
            if (err) {
              if (typeof err === 'string')
                err = new AuthErrorTemplate(err);
              return router.responseError(err.code || 401, err, req, res);
            }

            if (valid) {
              return next();
            }
            else {
              //joola.stats.incr('auth:middleware_invalid');
              return router.responseError(401, new Error('Failed to validate request'), req, res);
            }
          });
        });
      }
      else {
        return router.responseError(401, new Error('Failed to validate request'), req, res);
      }
    });
  });
};

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
    /* istanbul ignore next */
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
    /* istanbul ignore next */
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
  callback = callback || function () {
  };
  if (!token)
    return process.nextTick(function () {
      return callback(new Error('Token not provided'));
    });

  joola.users.verifyAPIToken({user: joola.SYSTEM_USER}, token, function (err, user) {
    if (!err)
      return callback(null, user);

    /* istanbul ignore else */
    if (joola.redis) {
      joola.redis.hgetall(joola.config.namespace + ':auth:tokens:' + token, function (err, _token) {
        /* istanbul ignore if */
        if (err)
          return process.nextTick(function () {
            return callback(err);
          });
        if (!_token)
          return process.nextTick(function () {
            return callback(new Error('Token not found'));
          });
        /* istanbul ignore if */
        if (!_token.user)
          return process.nextTick(function () {
            return callback(new Error('Failed to translate user from token'));
          });
        try {
          _token.user = JSON.parse(_token.user);
        }
        catch (ex) {
          /* istanbul ignore next */
          return process.nextTick(function () {
            return callback(ex);
          });
        }

        return process.nextTick(function () {
          return callback(null, _token.user);
        });
      });
    }
    else {
      var _token = joola.memory.get('token:' + token);
      if (!_token)
        return process.nextTick(function () {
          return callback(new Error('Token not found'));
        });
      if (!_token.user)
        return process.nextTick(function () {
          return callback(new Error('Failed to translate user from token'));
        });

      return process.nextTick(function () {
        return callback(null, _token.user);
      });
    }
  });
};