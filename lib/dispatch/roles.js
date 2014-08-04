/**
 *  @title joola/lib/dispatch/roles
 *  @overview Provides role management as part of user management.
 *  @description
 *  joola uses the concept of `roles` to bind permissions together into a groups and then assign to a user. Roles are logical
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

'use strict';

var
  joola = require('../joola'),

  router = require('../webserver/routes/index'),
  Proto = require('./prototypes/role');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined roles:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured roles.
 *
 * Configuration elements participating: `config:authentication:roles`.
 *
 * Events raised via `dispatch`: `roles:list-request`, `roles:list-done`
 *
 * ```js
 * joola.dispatch.roles.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/roles/list",
  description: "I list all available roles",
  inputs: ['workspace'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['roles:list'],
  _dispatch: {
    message: 'roles:list'
  },
  run: function (context, workspace, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    joola.dispatch.workspaces.get(context, workspace, function (err, _workspace) {
      if (err)
        return callback(err);

      var result = joola.common.obj2array(_workspace.roles);

      result.forEach(function (r, i) {
        result[i] = new Proto(r);
      });


      return callback(null, result);
    });
  }
};

/**
 * @function get
 * @param {string} name holds the name of the role to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `name` of the role
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested username.
 *
 * Configuration elements participating: `config:authentication:roles`.
 *
 * Events raised via `dispatch`: `roles:get-request`, `roles:get-done`
 *
 * ```js
 * joola.dispatch.roles.get('test-role', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/roles/get",
  description: "I get a specific role by name`",
  inputs: ['workspace', 'name'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['roles:get'],
  _dispatch: {
    message: 'roles:get'
  },
  run: function (context, workspace, rolename, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    joola.config.get('workspaces:' + workspace + ':roles:' + rolename, function (err, value) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      if (typeof value === 'undefined' || value === null)
        return callback(new Error('Role [' + rolename + '] does not exist.'));

      value = new Proto(value);
      return callback(null, value);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new role
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `name` of the new role
 * - `permissions` included as part of this role.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added role.
 *
 * Configuration elements participating: `config:authentication:roles`.
 *
 * Events raised via `dispatch`: `roles:add-request`, `roles:add-done`
 *
 * ```js
 * var options = {
 *   name: 'test-role',
 *   permissions: ['access_system']
 * };
 *
 * joola.dispatch.roles.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/roles/add",
  description: "I add a new user",
  inputs: ['workspace', 'role'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['roles:add'],
  _dispatch: {
    message: 'roles:add'
  },
  run: function (context, workspace, role, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    try {
      role = new Proto(role);
    } catch (ex) {
      return callback(ex);
    }

    exports.get.run(context, workspace, role.key, function (err, _role) {
      if (_role)
        return callback(new Error('Role [' + role.key + '] already exists for workspace [' + workspace + ']'));

      joola.config.set('workspaces:' + workspace + ':roles:' + role.key, role, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(err, role);
      });
    });
  }
};

exports.patch = {
  name: "/roles/patch",
  description: "I patch an existing role",
  inputs: ['workspace', 'role', 'payload'],
  _outputExample: {},
  _permission: ['roles:patch'],
  _dispatch: {
    message: 'roles:patch'
  },
  run: function (context, workspace, role, payload, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, role, function (err, value) {
      if (err)
        return callback(err);

      var _role = null;
      try {
        _role = joola.common.extend(value, payload);
        _role = new Proto(_role);
      } catch (ex) {
        return callback(ex);
      }

      joola.config.set('workspaces:' + workspace + ':roles:' + role, _role, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(err, _role);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the role to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes a role described in `options`:
 * - `name` of the role to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted role.
 *
 * Configuration elements participating: `config:authentication:roles`.
 *
 * Events raised via `dispatch`: `roles:delete-request`, `roles:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-role'
 * };
 *
 * joola.dispatch.roles.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/roles/delete",
  description: "I delete an existing role",
  inputs: ['workspace', 'role'],
  _outputExample: {},
  _permission: ['roles:delete'],
  _dispatch: {
    message: 'roles:delete'
  },
  run: function (context, workspace, role, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, role, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('workspaces:' + workspace + ':roles:' + role, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        exports.get.run(context, workspace, role, function (err, value) {
          if (!value)
            return callback(null, {});

          /* istanbul ignore next */
          return callback(new Error('Failed to delete role [' + role + '].'));
        });
      });
    });
  }
};
