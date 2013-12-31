/**
 *  @title joola.io/lib/dispatch/permissions
 *  @overview Provides permission management as part of user management.
 *  @description
 *  joola.io uses the concept of `permissions` to bind permissions together into a groups and then assign to a user. permissions are logical
 *  entities and provide the developer/user with the ability to manage permissions in a granular fashion while allowing overlap.
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
  Proto = require('./prototypes/permission');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined permissions:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured permissions.
 *
 * Configuration elements participating: `config:authentication:permissions`.
 *
 * Events raised via `dispatch`: `permissions:list-request`, `permissions:list-done`
 *
 * ```js
 * joola.dispatch.permissions.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/api/permissions/list",
  description: "I list all available permissions",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'permissions:list'
  },
  run: function (callback) {
    callback = callback || emptyfunc;
    joola.config.get('authentication:permissions', function (err, value) {
      if (err) {
        return callback(err);
      }

      if (typeof value === 'undefined')
        value = {};

      value = ['manage_system','access_system'];
      
      return callback(null, value);
    });
  }
};

/**
 * @function get
 * @param {string} name holds the name of the permission to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `name` of the permission
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested username.
 *
 * Configuration elements participating: `config:authentication:permissions`.
 *
 * Events raised via `dispatch`: `permissions:get-request`, `permissions:get-done`
 *
 * ```js
 * joola.dispatch.permissions.get('test-permission', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/api/permissions/get",
  description: "I get a specific permission by name`",
  inputs: ['name'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'permissions:get'
  },
  run: function (permissionname, callback) {
    callback = callback || emptyfunc;
    joola.config.get('authentication:permissions:' + permissionname, function (err, value) {
      if (err)
        return callback(err);

      if (typeof value === 'undefined')
        return callback(new Error('permission [' + permissionname + '] does not exist.'));

      return callback(null, value);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new permission
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `name` of the new permission
 * - `permissions` included as part of this permission.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added permission.
 *
 * Configuration elements participating: `config:authentication:permissions`.
 *
 * Events raised via `dispatch`: `permissions:add-request`, `permissions:add-done`
 *
 * ```js
 * var options = {
 *   name: 'test-permission',
 *   permissions: ['access_system']
 * };
 *
 * joola.dispatch.permissions.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/api/permissions/add",
  description: "I add a new user",
  inputs: ['permission'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'permissions:add'
  },
  run: function (permission, callback) {
    callback = callback || emptyfunc;

    try {
      permission = new Proto(permission);
    } catch (ex) {
      return callback(ex);
    }
    joola.config.get('authentication:permissions', function (err, value) {
      if (err)
        return callback(err);

      var _permissions;
      if (!value)
        _permissions = {};
      else
        _permissions = value;

      if (_permissions[permission.name])
        return callback(new Error('A permission with name [' + permission.name + '] already exists.'));

      _permissions[permission.name] = permission;
      joola.config.set('authentication:permissions', _permissions, function (err) {
        if (err)
          return callback(err);

        return callback(err, permission);
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the permission to update and the new details
 * @param {Function} [callback] called following execution with errors and results.
 * Updates an existing user described in `options`:
 * - `name` name of the permission (cannot be updated).
 * - `permissions` permissions to be included as part of the permission
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated permission.
 *
 * Configuration elements participating: `config:authentication:permissions`.
 *
 * Events raised via `dispatch`: `permissions:update-request`, `permissions:update-done`
 *
 * ```js
 * var options = {
 *   name: 'test-permission',
 *   permissions: ['access_system']
 * };
 *
 * joola.dispatch.permissions.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.update = {
  name: "/api/permissions/update",
  description: "I update an existing permission",
  inputs: ['permission'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'permissions:update'
  },
  run: function (permission, callback) {
    callback = callback || emptyfunc;

    try {
      permission = new Proto(permission);
    } catch (ex) {
      return callback(ex);
    }

    joola.config.get('authentication:permissions', function (err, value) {
      if (err)
        return callback(err);

      var _permissions;
      if (!value)
        _permissions = {};
      else
        _permissions = value;

      if (!_permissions.hasOwnProperty(permission.name))
        return callback(new Error('permission with name [' + permission.name + '] does not exist.'));
      _permissions[permission.name] = permission;
      joola.config.set('authentication:permissions', _permissions, function (err) {
        if (err)
          return callback(err);

        return callback(err, permission);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the permission to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes a permission described in `options`:
 * - `name` of the permission to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted permission.
 *
 * Configuration elements participating: `config:authentication:permissions`.
 *
 * Events raised via `dispatch`: `permissions:delete-request`, `permissions:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-permission'
 * };
 *
 * joola.dispatch.permissions.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/api/permissions/delete",
  description: "I delete an existing permission",
  inputs: ['permission'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'permissions:delete'
  },
  run: function (permission, callback) {
    callback = callback || emptyfunc;

    exports.get.run(permission.name, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('authentication:permissions:' + permission.name, function (err) {
        if (err)
          return callback(err);

        joola.config.get('authentication:permissions:' + permission.name, function (err, value) {
          if (err)
            return callback(err);
          if (!value || !value.hasOwnProperty('name'))
            return callback(null, permission);

          return callback(new Error('Failed to delete permission [' + permission.name + '].'));
        });
      });
    });
  }
};