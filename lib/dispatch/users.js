/**
 *  @title joola.io/lib/dispatch/users
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
var
  joola = require('../joola.io'),

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
  name: "/api/users/list",
  description: "I list all available users",
  inputs: ['organization'],
  _outputExample: {},
  _permission: ['manage_users'],
  _dispatch: {
    message: 'users:list'
  },
  run: function (context, organization, callback) {
    callback = callback || emptyfunc;

    if (!context.user.su && context.user.organization != organization)
      return callback(new Error('Insufficient permissions'));

    joola.config.get('authentication:organizations:' + organization + ':users', function (err, value) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      /* istanbul ignore if */
      if (typeof value === 'undefined')
        value = {};

      Object.keys(value).forEach(function (key) {
        value[key] = new Proto().sanitize(value[key]);
      });

      return callback(null, value);
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
  name: "/api/users/get",
  description: "I get a specific users by username",
  inputs: ['organization', 'username'],
  _outputExample: {},
  _permission: ['manage_users'],
  _dispatch: {
    message: 'users:get'
  },
  run: function (context, organization, username, callback) {
    callback = callback || emptyfunc;

    if (!context.user.su && context.user.organization != organization)
      return callback(new Error('Insufficient permissions'));

    joola.dispatch.organizations.get(context, organization, function (err, org) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      var found = false;
      if (org.users) {
        Object.keys(org.users).forEach(function (user) {
          user = org.users[user];
          if (user.username === username) {
            found = true;
            return callback(null, user);
          }
        });
      }
      if (!found) {
        return callback(new Error('User [' + username + '] of organization [' + organization + '] does not exist.'));
      }
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
  name: "/api/users/getByToken",
  description: "I get a specific user by token",
  inputs: ['token'],
  _outputExample: {},
  _permission: ['access_system'],
  _dispatch: {
    message: 'users:getByToken'
  },
  run: function (context, token, callback) {
    callback = callback || emptyfunc;
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
  name: "/api/users/add",
  description: "I add a new user",
  inputs: ['organization', 'user'],
  _outputExample: {},
  _permission: ['manage_users'],
  _dispatch: {
    message: 'users:add'
  },
  run: function (context, organization, user, callback) {
    callback = callback || emptyfunc;

    if (!context.user.su && context.user.organization != organization)
      return callback(new Error('Insufficient permissions'));

    if (user && typeof(user) === 'object')
      delete user.su;

    new Proto(context, user, function (err, user) {
      if (err)
        return callback(err);
      user._password = joola.auth.hashPassword(user._password);
      /* istanbul ignore if */
      if (user._password === null)
        return callback(new Error('Failed to hash password'));

      exports.get.run(context, organization, user.username, function (err, _user) {
        if (_user)
          return callback(new Error('User already exists'));

        joola.config.set('authentication:organizations:' + organization + ':users:' + user.username, user, function (err) {
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
exports.update = {
  name: "/api/users/update",
  description: "I update an existing user",
  inputs: ['organization', 'user'],
  _outputExample: {},
  _permission: ['manage_users'],
  _dispatch: {
    message: 'users:update'
  },
  run: function (context, organization, user, callback) {
    callback = callback || emptyfunc;
    //new Proto(user, function (err, user) {
    //if (user._password === null)
    // return callback(new Error('Failed to hash password'));

    if (!context.user.su && context.user.organization != organization)
      return callback(new Error('Insufficient permissions'));

    if (user && typeof(user) === 'object')
      delete user.su;

    if (user._password)
      user._password = joola.auth.hashPassword(user._password);

    exports.get.run(context, organization, user.username, function (err, _user) {
      if (err)
        return callback(err);

      joola.config.set('authentication:organizations:' + organization + ':users:' + user.username, user, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(err, user);
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
  name: "/api/users/delete",
  description: "I delete an existing user",
  inputs: ['organization', 'user'],
  _outputExample: {},
  _permission: ['manage_users'],
  _dispatch: {
    message: 'users:delete'
  },
  run: function (context, organization, user, callback) {
    callback = callback || emptyfunc;

    if (!context.user.su && context.user.organization != organization)
      return callback(new Error('Insufficient permissions'));

    exports.get.run(context, organization, user.username, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('authentication:organizations:' + organization + ':users:' + user.username, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        exports.get.run(context, organization, user.username, function (err, value) {
          /* istanbul ignore if */
          if (value)
            return callback(new Error('Failed to delete user [' + user.username + '] of organization [' + organization + '].'));

          return callback(null);
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
  name: "/api/users/authenticate",
  description: "I authenticate users",
  inputs: ['organization', 'username', 'password'],
  _outputExample: {},
  _permission: ['access_system'],
  _dispatch: {
    message: 'users:authenticate'
  },
  run: function (context, organization, username, password, callback) {
    callback = callback || emptyfunc;

    exports.get.run(context, organization, username, function (err, user) {
      if (err)
        return callback(err);

      if (joola.auth.validatePassword(password, user._password)) {
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
  name: "/api/users/verifyAPIToken",
  description: "I verify API tokens",
  inputs: ['APIToken'],
  _outputExample: {},
  _permission: ['access_system'],
  _dispatch: {
    message: 'users:verifyAPIToken'
  },
  run: function (context, APIToken, callback) {
    callback = callback || emptyfunc;
    var _user;
    joola.config.get('authentication:organizations', function (err, orgs) {
      Object.keys(orgs).forEach(function (org) {
        org = orgs[org];
        if (org.users) {
          Object.keys(org.users).forEach(function (user) {
            user = org.users[user];
            if (user.APIToken == APIToken) {
              _user = user;
            }
          });
        }
      });
      if (_user)
        return callback(null, _user);
      else
        return callback(new Error('API Token not found'));
    });
  }
};