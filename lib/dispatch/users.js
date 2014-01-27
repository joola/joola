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
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system', 'access_system'],
  _dispatch: {
    message: 'users:list'
  },
  run: function (context, callback) {
    callback = callback || emptyfunc;
    joola.config.get('authentication:users', function (err, value) {
      if (err) {
        return callback(err);
      }

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
  inputs: ['username'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'users:get'
  },
  run: function (context, username, callback) {
    callback = callback || emptyfunc;
    joola.config.get('authentication:users:' + username, function (err, value) {
      try {
        if (err)
          return callback(err);

        if (typeof value === 'undefined') {
          return callback(new Error('User [' + username + '] does not exist.'));
        }

        return callback(null, value);
      }
      catch (ex) {

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
  inputs: ['username'],
  _outputExample: {},
  _permission: ['access_system', 'manage_system'],
  _dispatch: {
    message: 'users:getByToken'
  },
  run: function (context, username, callback) {
    callback = callback || emptyfunc;
    joola.auth.getUserByToken(username, function (err, value) {
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
  inputs: ['user'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'users:add'
  },
  run: function (context, user, callback) {
    callback = callback || emptyfunc;

    new Proto(user, function (err, user) {
      if (err)
        return callback(err);

      user._password = joola.auth.hashPassword(user._password);
      if (user._password === null)
        return callback(new Error('Failed to hash password'));

      joola.config.get('authentication:users', function (err, value) {
        if (err)
          return callback(err);

        var _users;
        if (!value)
          _users = {};
        else
          _users = value;

        if (_users[user.username])
          return callback(new Error('A user with username [' + user.username + '] already exists.'));

        _users[user.username] = user;
        joola.config.set('authentication:users', _users, function (err) {
          if (err)
            return callback(err);

          return callback(err, user);
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
  inputs: ['user'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'users:update'
  },
  run: function (context, user, callback) {
    callback = callback || emptyfunc;

    //new Proto(user, function (err, user) {
    //if (user._password === null)
    // return callback(new Error('Failed to hash password'));

    joola.config.get('authentication:users', function (err, value) {
      if (err)
        return callback(err);

      var _users;
      if (!value)
        _users = {};
      else
        _users = value;

      if (!_users.hasOwnProperty(user.username))
        return callback(new Error('User with username [' + user.username + '] does not exist.'));

      var _user = _users[user.username];
      _user = joola.common._extend(_user, user);
      _users[user.username] = _user;

      joola.config.set('authentication:users', _users, function (err) {
        if (err)
          return callback(err);

        return callback(err, _user);
      });
    });
    //});
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
  inputs: ['user'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'users:delete'
  },
  run: function (context, user, callback) {
    callback = callback || emptyfunc;

    exports.get.run(context, user.username, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('authentication:users:' + user.username, function (err) {
        if (err)
          return callback(err);

        joola.config.get('authentication:users:' + user.username, function (err, value) {
          if (err)
            return callback(err);
          if (!value)
            return callback(null, user);

          return callback(new Error('Failed to delete user [' + user.username + '].'));
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
  inputs: ['username', 'password'],
  _outputExample: {},
  _permission: ['access_system'],
  _dispatch: {
    message: 'users:authenticate'
  },
  run: function (context, username, password, callback) {
    if (!username)
      return callback(new Error('Username not provided'));
    if (!password)
      return callback(new Error('Password not provided'));

    exports.get.run(context, username, function (err, user) {
      if (err)
        return callback(err);

      if (joola.auth.validatePassword(password, user._password)) {
        if (err)
          return callback(err);

        joola.auth.generateToken(user, function (err, token) {
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