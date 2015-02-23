/**
 *  @title joola/lib/dispatch/users
 *  @overview Provides user management functionality across the framework.
 *  @description
 *  The `users` dispatch manages the entire flow relating to users, for example: listing or adding a user.
 *  The module follows the guidelines and flow defined in [Disptach Flow](dispatch-flow).
 *
 * - [list](#list)
 * - [get](#get)
 * - [add](#add)
 * - [update](#update)
 * - [delete](#delete)
 *
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/

'use strict';

var
  joola = require('../joola'),

  router = require('../webserver/routes/index'),
  Proto = require('./prototypes/user');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined users:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured users.
 *
 * Configuration elements participating: `config:authentication:users`.
 *
 * Events raised via `dispatch`: `users:list-request`, `users:list-done`
 *
 * ```js
 * joola.dispatch.users.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/users/list",
  description: "I list all available users",
  inputs: ['workspace'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['users:list'],
  _dispatch: {
    message: 'users:list'
  },
  run: function (context, workspace, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    joola.config.get('workspaces:' + workspace + ':users', function (err, value) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      /* istanbul ignore if */
      if (typeof value === 'undefined' || value === null)
        value = {};

      Object.keys(value).forEach(function (key) {
        value[key].workspace = workspace;
      });

      return callback(null, joola.common.obj2array(value));
    });
  }
};

/**
 * @function get
 * @param {string} username holds the username of the user to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `username` of the user
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested user.
 *
 * Configuration elements participating: `config:authentication:users`.
 *
 * Events raised via `dispatch`: `users:get-request`, `users:get-done`
 *
 * ```js
 * joola.dispatch.users.get('tester', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/users/get",
  description: "I get a specific users by username",
  inputs: ['workspace', 'username'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['users:get'],
  _dispatch: {
    message: 'users:get'
  },
  run: function (context, workspace, username, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    joola.config.get('workspaces:' + workspace + ':users:' + username, function (err, user) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      if (typeof user === 'undefined' || user === null)
        return callback(new Error('User [' + username + '] does not exist.'));

      user.workspace = workspace;

      new Proto(context, workspace, user, callback);
    });
  }
};

/**
 * @function getByToken
 * @param {string} token to translate into user.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `token` to translate into user.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested user.
 *
 * Configuration elements participating: `config:authentication:users`.
 *
 * Events raised via `dispatch`: `users:getByToken-request`, `users:getByToken-done`
 *
 * ```js
 * joola.dispatch.users.getByToken('12345', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.getByToken = {
  name: "/users/getByToken",
  description: "I get a specific user by token",
  inputs: ['token'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['guest'],
  _dispatch: {
    message: 'users:getByToken'
  },
  run: function (context, token, callback) {
    callback = callback || function () {
    };
    joola.auth.getUserByToken(token, function (err, value) {
      return callback(err, value);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new user
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `username` of the new user
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added user.
 *
 * Configuration elements participating: `config:authentication:users`.
 *
 * Events raised via `dispatch`: `users:add-request`, `users:add-done`
 *
 * ```js
 * var options = {
 *   username: 'newuser'
 * };
 *
 * joola.dispatch.users.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/users/add",
  description: "I add a new user",
  inputs: ['workspace', 'user'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['users:add'],
  _dispatch: {
    message: 'users:add'
  },
  run: function (context, workspace, user, callback) {
    callback = callback || function () {
    };

    var err;
    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    new Proto(context, workspace, user, function (err, user) {
      if (err)
        return callback(err);

      if (user.permissions && user.permissions.indexOf('superuser') > -1) {
        err = new Error('Forbidden');
        err.code = 403;
        return callback(err);
      }

      user.password = joola.auth.hashPassword(user.password);
      /* istanbul ignore if */
      if (user.password === null)
        return callback(new Error('Failed to hash password'));

      exports.get.run(context, workspace, user.username, function (err, _user) {
        if (_user)
          return callback(new Error('User already exists'));

        joola.config.set('workspaces:' + workspace + ':users:' + user.username, user, function (err) {
          /* istanbul ignore if */
          if (err)
            return callback(err);

          return callback(null, user);
        });
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the user to update and the new details
 * @param {Function} [callback] called following execution with errors and results.
 * Updates an existing user described in `options`:
 * - `username` name of the user (cannot be updated)
 * - `displayName` pretty name for the user.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated user.
 *
 * Configuration elements participating: `config:authentication:users`.
 *
 * Events raised via `dispatch`: `users:update-request`, `users:update-done`
 *
 * ```js
 * var options = {
 *   username: 'newuser',
 *   displayName: 'updated display name'
 * };
 *
 * joola.dispatch.users.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.patch = {
  name: "/users/patch",
  description: "I patch an existing user",
  inputs: ['workspace', 'username', 'user'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['users:patch'],
  _dispatch: {
    message: 'users:patch'
  },
  run: function (context, workspace, username, payload, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    if (payload && typeof(payload) === 'object')
      delete payload.su;

    if (payload.password)
      payload.password = joola.auth.hashPassword(payload.password);

    exports.get.run(context, workspace, username, function (err, user) {
      if (err)
        return callback(err);

      var _user = joola.common.extend(user, payload);
      new Proto(context, workspace, _user, function (err, _user) {
        if (err)
          return callback(err);

        if (user.permissions && user.permissions.indexOf('superuser') > -1) {
          err = new Error('Forbidden');
          err.code = 403;
          return callback(err);
        }

        joola.config.set('workspaces:' + workspace + ':users:' + username, _user, function (err) {
          /* istanbul ignore if */
          if (err)
            return callback(err);

          _user.workspace = workspace;
          return callback(err, _user);
        });
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the user to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes a user described in `options`:
 * - `username` of the user to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted user.
 *
 * Configuration elements participating: `config:authentication:users`.
 *
 * Events raised via `dispatch`: `users:delete-request`, `users:delete-done`
 *
 * ```js
 * var options = {
 *   username: 'newuser'
 * };
 *
 * joola.dispatch.users.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/users/delete",
  description: "I delete an existing user",
  inputs: ['workspace', 'user'],
  _proto: null,
  _outputExample: {},
  _permission: ['users:delete'],
  _dispatch: {
    message: 'users:delete'
  },
  run: function (context, workspace, username, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, username, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('workspaces:' + workspace + ':users:' + username, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        exports.get.run(context, workspace, username, function (err, value) {
          /* istanbul ignore if */
          if (value)
            return callback(new Error('Failed to delete user [' + username + '] of workspace [' + workspace + '].'));

          return callback(null, {});
        });
      });
    });
  }
};

/**
 * @function authenticate
 * @param {string} username contains username to authenticate
 * @param {string} password contains plain password for comparison to stored hash
 * @return {string} hashed password with the hash.
 * Authenticates a user given username/password
 * - `username` contains username to authenticate
 * - `password` contains plain password for comparison to stored hash
 *
 * The function returns on completion a boolean indicating if the user is authenticated
 *
 * Events raised via `dispatch`: `users:authenticate-request`, `users:authenticate-done`
 *
 * ```js
 * var plainPassword = 'password'
 * var authenticated = joola.dispatch.users.authenticate('user', 'password');
 * console.log(authenticated);
 * ```
 */
exports.authenticate = {
  name: "/users/authenticate",
  description: "I authenticate users",
  inputs: ['workspace', 'username', 'password'],
  _outputExample: {},
  _permission: ['guest'],
  _dispatch: {
    message: 'users:authenticate'
  },
  run: function (context, workspace, username, password, callback) {
    callback = callback || function () {
    };

    var err;
    if (!joola.config.get('authentication:basicauth').enabled) {
      err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }
    else if (joola.webserver.http && joola.config.get('authentication:basicauth').enabled && joola.config.get('authentication:basicauth:enable_with_http') !== true) {
      err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, username, function (err, user) {
      if (err)
        return callback(err);

      if (joola.auth.validatePassword(password, user.password)) {
        joola.auth.generateToken(user, function (err, token) {
          /* istanbul ignore if */
          if (err)
            return callback(err);

          return callback(null, token);
        });
      }
      else
        return callback(new Error('Invalid password provided for user [' + username + ']'));
    });
  }
};

/**
 * @function verifyAPIToken
 * @param {string} username contains username to authenticate
 * @param {string} password contains plain password for comparison to stored hash
 * @return {string} hashed password with the hash.
 * Authenticates a user given username/password
 * - `username` contains username to authenticate
 * - `password` contains plain password for comparison to stored hash
 *
 * The function returns on completion a boolean indicating if the user is authenticated
 *
 * Events raised via `dispatch`: `users:authenticate-request`, `users:authenticate-done`
 *
 * ```js
 * var plainPassword = 'password'
 * var authenticated = joola.dispatch.users.authenticate('user', 'password');
 * console.log(authenticated);
 * ```
 */
exports.verifyAPIToken = {
  name: "/users/verifyAPIToken",
  description: "I verify API tokens",
  inputs: ['token'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['guest'],
  _dispatch: {
    message: 'users:verifyAPIToken'
  },
  run: function (context, APIToken, callback) {
    callback = callback || function () {
    };

    var found = null;
    return joola.dispatch.workspaces.list({user: joola.SYSTEM_USER}, function (err, wrks) {
      if (err)
        return callback(err);

      wrks.forEach(function (wrk) {
        if (wrk.users) {
          Object.keys(wrk.users).forEach(function (user) {
            user = wrk.users[user];
            if (user.APIToken === APIToken) {
              found = user;
              found.workspace = wrk.key;
            }
          });
        }
      });
      if (found)
        return exports.get.run({user: joola.SYSTEM_USER}, found.workspace, found.username, callback);
      else {
        setImmediate(function () {
          return callback(new Error('API Token not found'));
        });
      }
    });
  }
};

exports.generateToken = {
  name: "/users/generateToken",
  description: "I generate tokens for users",
  inputs: ['user'],
  _proto: require('./prototypes/token').proto,
  _outputExample: {},
  _permission: ['users:generateToken'],
  _dispatch: {
    message: 'users:generateToken'
  },
  run: function (context, user, callback) {
    callback = callback || function () {
    };

    if (!user.workspace)
      user.workspace = context.user.workspace;
    else if (context.user.workspace !== user.workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    joola.auth.generateToken(user, function (err, token) {
      if (err)
        return callback(err);

      return callback(null, token);
    });
  }
};

exports.validateToken = {
  name: "/users/validateToken",
  description: "I validate tokens for users",
  inputs: ['token'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['users:validateToken'],
  _dispatch: {
    message: 'users:validateToken'
  },
  run: function (context, token, callback) {
    callback = callback || function () {
    };
    joola.auth.validateToken(null, token, null, function (err, user) {
      if (err)
        return callback(err);

      return callback(null, user);
    });
  }
};

exports.expireToken = {
  name: "/users/expireToken",
  description: "I expire tokens for users",
  inputs: ['token'],
  _outputExample: {},
  _permission: ['users:expireToken'],
  _dispatch: {
    message: 'users:expireToken'
  },
  run: function (context, token, callback) {
    callback = callback || function () {
    };
    joola.auth.expireToken(token, function (err, user) {
      if (err)
        return callback(err);

      return callback(null, {});
    });
  }
};