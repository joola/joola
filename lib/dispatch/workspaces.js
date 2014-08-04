/**
 *  @title joola/lib/dispatch/workspaces
 *  @overview Provides workspace management as part of user management.
 *  @description
 *  joola uses the concept of `workspace` to bind users together into a groups. workspaces are logical business
 *  entities and provide the developer/user with the ability to manage permissions and filters, based not only on users
 *  and roles, but also on an workspace level.
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
  Proto = require('./prototypes/workspace');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined workspaces:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured workspaces.
 *
 * Configuration elements participating: `config:workspaces`.
 *
 * Events raised via `dispatch`: `workspaces:list-request`, `workspaces:list-done`
 *
 * ```js
 * joola.dispatch.workspaces.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/workspaces/list",
  description: "I list all available workspaces",
  inputs: [],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['workspaces:list'],
  _dispatch: {
    message: 'workspaces:list'
  },
  run: function (context, callback) {
    callback = callback || function () {
    };

    joola.config.get('workspaces', function (err, value) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      /* istanbul ignore if */
      if (typeof value === 'undefined')
        value = {};

      var result = joola.common.obj2array(value);
      result.forEach(function (r, i) {
        result[i] = new Proto(r);
      });
      return callback(null, result);
    });
  }
};

/**
 * @function get
 * @param {string} name holds the name of the workspace to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `name` of the workspace
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested username.
 *
 * Configuration elements participating: `config:workspaces`.
 *
 * Events raised via `dispatch`: `workspaces:get-request`, `workspaces:get-done`
 *
 * ```js
 * joola.dispatch.workspaces.get('test-workspace', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/workspaces/get",
  description: "I get a specific workspace by key`",
  inputs: ['key'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['workspaces:get'],
  _dispatch: {
    message: 'workspaces:get'
  },
  run: function (context, key, callback) {
    callback = callback || function () {
    };

    /*
    if (context.user.workspace !== key && !context.user.su) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }*/

    joola.config.get('workspaces:' + key, function (err, value) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      if (typeof value === 'undefined' || value === null)
        return callback(new Error('workspace with key [' + key + '] does not exist.'));

      value = new Proto(value);

      return callback(null, value);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new workspace
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `name` of the new workspace
 * - `filter` to apply on workspace members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added workspace.
 *
 * Configuration elements participating: `config:workspaces`.
 *
 * Events raised via `dispatch`: `workspaces:add-request`, `workspaces:add-done`
 *
 * ```js
 * var options = {
 *   name: 'test-workspace',
 *   filter: 'Country=France'
 * };
 *
 * joola.dispatch.workspaces.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/workspaces/add",
  description: "I add a new user",
  inputs: ['workspace'],
  _outputExample: {},
  _permission: ['workspaces:add'],
  _dispatch: {
    message: 'workspaces:add'
  },
  run: function (context, workspace, callback) {
    callback = callback || function () {
    };

    try {
      workspace = new Proto(workspace);
    } catch (ex) {
      return callback(ex);
    }

    exports.get.run(context, workspace.key, function (err) {
      if (!err)
        return callback(new Error('workspace already exists'));

      joola.config.set('workspaces:' + workspace.key, workspace, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(err, workspace);
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the workspace to update and the new details
 * @param {Function} [callback] called following execution with errors and results.
 * Updates an existing user described in `options`:
 * - `name` name of the workspace (cannot be updated).
 * - `_filter` filter to be applied on workspace's members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated workspace.
 *
 * Configuration elements participating: `config:workspaces`.
 *
 * Events raised via `dispatch`: `workspaces:update-request`, `workspaces:update-done`
 *
 * ```js
 * var options = {
 *   name: 'test-workspace',
 *   _filter: 'Country=France'
 * };
 *
 * joola.dispatch.workspaces.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.patch = {
  name: "/workspaces/patch",
  description: "I patch an existing workspace",
  inputs: ['workspace', 'payload'],
  _outputExample: {},
  _permission: ['workspaces:patch'],
  _dispatch: {
    message: 'workspaces:patch'
  },
  run: function (context, workspace, payload, callback) {
    callback = callback || function () {
    };

    /*
    if (context.user.workspace !== workspace && !context.user.su) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }
    */

    exports.get.run(context, workspace, function (err, value) {
      if (err)
        return callback(err);

      var _workspace = null;
      try {
        _workspace = joola.common.extend(value, payload);
        _workspace = new Proto(_workspace);
      } catch (ex) {
        return callback(ex);
      }

      joola.config.set('workspaces:' + workspace, _workspace, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(err, _workspace);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the workspace to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes an workspace described in `options`:
 * - `name` of the workspace to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted workspace.
 *
 * Configuration elements participating: `config:workspaces`.
 *
 * Events raised via `dispatch`: `workspaces:delete-request`, `workspaces:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-workspace'
 * };
 *
 * joola.dispatch.workspaces.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/workspaces/delete",
  description: "I delete an existing workspace",
  inputs: ['workspace'],
  _outputExample: {},
  _permission: ['workspaces:delete'],
  _dispatch: {
    message: 'workspaces:delete'
  },
  run: function (context, workspace, callback) {
    callback = callback || function () {
    };

    exports.get.run(context, workspace, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('workspaces:' + workspace, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        exports.get.run(context, workspace, function (err, value) {
          if (err)
            return callback(null, {});

          /* istanbul ignore next */
          return callback(new Error('Failed to delete workspace [' + workspace + '].'));
        });
      });
    });
  }
};