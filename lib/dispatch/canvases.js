/**
 *  @title joola.io/lib/dispatch/canvases
 *  @overview Provides canvas management as part of user management.
 *  @description
 *  joola.io uses the concept of `canvas` to bind users together into a groups. canvases are logical business
 *  entities and provide the developer/user with the ability to manage permissions and filters, based not only on users
 *  and roles, but also on an canvas level.
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
  _ = require('underscore'),
  router = require('../webserver/routes/index'),
  Proto = require('./prototypes/canvas');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined canvases:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured canvases.
 *
 * Configuration elements participating: `config:canvases`.
 *
 * Events raised via `dispatch`: `canvases:list-request`, `canvases:list-done`
 *
 * ```js
 * joola.dispatch.canvases.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/canvases/list",
  description: "I list all available canvases",
  inputs: ['workspace'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['canvases:list'],
  _dispatch: {
    message: 'canvases:list'
  },
  run: function (context, workspace, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    joola.dispatch.workspaces.get(context, workspace, function (err, wrk) {
      if (err)
        return callback(err);
  
      return callback(null, joola.common.obj2array(wrk.canvases));
    });
  }
};

/**
 * @function get
 * @param {string} name holds the name of the canvas to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `name` of the canvas
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested username.
 *
 * Configuration elements participating: `config:canvases`.
 *
 * Events raised via `dispatch`: `canvases:get-request`, `canvases:get-done`
 *
 * ```js
 * joola.dispatch.canvases.get('test-canvas', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/canvases/get",
  description: "I get a specific canvas by key",
  inputs: ['workspace', 'key'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['canvases:get'],
  _dispatch: {
    message: 'canvases:get'
  },
  run: function (context, workspace, key, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    joola.dispatch.workspaces.get(context, workspace, function (err, wrk) {
      if (err)
        return callback(err);

      var result = _.filter(wrk.canvases, function (item) {
        return item.key === key;
      });

      if (!result || typeof result === 'undefined' || result === null || result.length === 0)
        return callback(new Error('canvas [' + key + '] does not exist.'));

      return callback(null, result[0]);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new canvas
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `name` of the new canvas
 * - `filter` to apply on canvas members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added canvas.
 *
 * Configuration elements participating: `config:canvases`.
 *
 * Events raised via `dispatch`: `canvases:add-request`, `canvases:add-done`
 *
 * ```js
 * var options = {
 *   name: 'test-canvas',
 *   filter: 'Country=France'
 * };
 *
 * joola.dispatch.canvases.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/canvases/add",
  description: "I add a new canvas",
  inputs: ['workspace',  'canvas' ],
  _outputExample: {},
  _permission: ['canvases:add'],
  _dispatch: {
    message: 'canvases:add'
  },
  run: function (context, workspace, canvas, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    canvas.type = 'canvas';
    try {
      canvas = new Proto(canvas);
    } catch (ex) {
      return callback(ex);
    }

    exports.get.run(context, workspace, canvas.key, function (err, _canvas) {
      if (!err) {
        return callback(new Error('canvas [' + canvas.key + '] already exists: ' + err));
      }

      joola.config.set('workspaces:' + workspace + ':canvases:' + canvas.key, canvas, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(null, canvas);
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the canvas to update and the new details
 * @param {Function} [callback] called following execution with errors and results.
 * Updates an existing user described in `options`:
 * - `name` name of the canvas (cannot be updated).
 * - `_filter` filter to be applied on canvas's members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated canvas.
 *
 * Configuration elements participating: `config:canvases`.
 *
 * Events raised via `dispatch`: `canvases:update-request`, `canvases:update-done`
 *
 * ```js
 * var options = {
 *   name: 'test-canvas',
 *   _filter: 'Country=France'
 * };
 *
 * joola.dispatch.canvases.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.patch = {
  name: "/canvases/patch",
  description: "I patch an existing canvas",
  inputs: ['workspace', 'canvas', 'payload'],
  _outputExample: {},
  _permission: ['canvases:patch'],
  _dispatch: {
    message: 'canvases:patch'
  },
  run: function (context, workspace, canvas, payload, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, canvas, function (err, value) {
      if (err)
        return callback(err);

      var _canvas = null;
      try {
        _canvas = joola.common.extend(value, payload);
        _canvas = new Proto(_canvas);
      } catch (ex) {
        return callback(ex);
      }

      joola.config.set('workspaces:' + workspace + ':canvases:' + canvas, _canvas, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(err, _canvas);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the canvas to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes an canvas described in `options`:
 * - `name` of the canvas to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted canvas.
 *
 * Configuration elements participating: `config:canvases`.
 *
 * Events raised via `dispatch`: `canvases:delete-request`, `canvases:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-canvas'
 * };
 *
 * joola.dispatch.canvases.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/canvases/delete",
  description: "I delete an existing canvas",
  inputs: ['workspace', 'canvas'],
  _outputExample: {},
  _permission: ['canvases:delete'],
  _dispatch: {
    message: 'canvases:delete'
  },
  run: function (context, workspace, canvas, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, canvas, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('workspaces:' + workspace + ':canvases:' + canvas, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(null, {});
      });
    });
  }
};