/**
 *  @title joola/lib/dispatch/dimensions
 *  @overview Provides dimension management as part of user management.
 *  @description
 *  joola uses the concept of `dimension` to bind users together into a groups. dimensions are logical business
 *  entities and provide the developer/user with the ability to manage permissions and filters, based not only on users
 *  and roles, but also on an dimension level.
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
  async = require('async'),
  router = require('../webserver/routes/index'),
  Proto = require('./prototypes/dimension');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined dimensions:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured dimensions.
 *
 * Configuration elements participating: `config:dimensions`.
 *
 * Events raised via `dispatch`: `dimensions:list-request`, `dimensions:list-done`
 *
 * ```js
 * joola.dispatch.dimensions.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/dimensions/list",
  description: "I list all available dimensions",
  inputs: {required: ['workspace'], optional: ['collection']},
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['dimensions:list'],
  _dispatch: {
    message: 'dimensions:list'
  },
  run: function (context, workspace, collection, callback) {
    if (typeof collection === 'function') {
      callback = collection;
      collection = null;
    }

    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    if (collection) {
      joola.dispatch.collections.get(context, workspace, collection, function (err, _collection) {
        if (err)
          return callback(err);

        return callback(null, joola.common.obj2array(_collection.dimensions));
      });
    }
    else {
      joola.dispatch.collections.list(context, workspace, function (err, collections) {
        if (err)
          return callback(err);

        var calls = [];
        var dimensions = [];
        collections.forEach(function (collection) {
          var call = function (cb) {
            joola.dispatch.collections.get(context, workspace, collection.key, function (err, _collection) {
              if (err)
                return cb(err);

              _collection.dimensions.forEach(function (m, i) {
                _collection.dimensions[i].collection = _collection.key;
              });
              return cb(null, _collection.dimensions);
            });
          };
          calls.push(call);
        });
        async.parallel(calls, function (err, results) {
          if (err)
            return callback(err);

          results.forEach(function (result) {
            dimensions = dimensions.concat(result);
          });
          return callback(null, dimensions);
        });
      });
    }
  }
};

/**
 * @function get
 * @param {string} name holds the name of the dimension to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `name` of the dimension
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested username.
 *
 * Configuration elements participating: `config:dimensions`.
 *
 * Events raised via `dispatch`: `dimensions:get-request`, `dimensions:get-done`
 *
 * ```js
 * joola.dispatch.dimensions.get('test-dimension', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/dimensions/get",
  description: "I get a specific dimension by key`",
  inputs: ['workspace', 'collection', 'key'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['dimensions:get'],
  _dispatch: {
    message: 'dimensions:get'
  },
  run: function (context, workspace, collection, key, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    joola.dispatch.collections.get(context, workspace, collection, function (err, _collection) {
      if (err)
        return callback(err);

      var result = _.filter(_collection.dimensions, function (item) {
        return item.key === key;
      });

      if (!result || typeof result === 'undefined' || result === null || result.length === 0)
        return callback(new Error('dimension [' + key + '] does not exist.'));

      return callback(null, result[0]);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new dimension
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `name` of the new dimension
 * - `filter` to apply on dimension members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added dimension.
 *
 * Configuration elements participating: `config:dimensions`.
 *
 * Events raised via `dispatch`: `dimensions:add-request`, `dimensions:add-done`
 *
 * ```js
 * var options = {
 *   name: 'test-dimension',
 *   filter: 'Country=France'
 * };
 *
 * joola.dispatch.dimensions.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/dimensions/add",
  description: "I add a new dimension",
  inputs: ['workspace', 'collection', 'dimension' ],
  _outputExample: {},
  _permission: ['dimensions:add'],
  _dispatch: {
    message: 'dimensions:add'
  },
  run: function (context, workspace, collection, dimension, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    dimension.type = 'dimension';
    try {
      dimension = new Proto(dimension);
    } catch (ex) {
      return callback(ex);
    }

    exports.get.run(context, workspace, collection, dimension.key, function (err, _dimension) {
      if (!err) {
        return callback(new Error('dimension [' + dimension.key + '] already exists: ' + err));
      }

      joola.config.set('workspaces:' + workspace + ':collections:' + collection + ':' + dimension.key, dimension, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(null, dimension);
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the dimension to update and the new details
 * @param {Function} [callback] called following execution with errors and results.
 * Updates an existing user described in `options`:
 * - `name` name of the dimension (cannot be updated).
 * - `_filter` filter to be applied on dimension's members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated dimension.
 *
 * Configuration elements participating: `config:dimensions`.
 *
 * Events raised via `dispatch`: `dimensions:update-request`, `dimensions:update-done`
 *
 * ```js
 * var options = {
 *   name: 'test-dimension',
 *   _filter: 'Country=France'
 * };
 *
 * joola.dispatch.dimensions.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.patch = {
  name: "/dimensions/patch",
  description: "I patch an existing dimension",
  inputs: ['workspace', 'collection', 'dimension', 'payload'],
  _outputExample: {},
  _permission: ['dimensions:patch'],
  _dispatch: {
    message: 'dimensions:patch'
  },
  run: function (context, workspace, collection, dimension, payload, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, collection, dimension, function (err, value) {
      if (err)
        return callback(err);

      var _dimension = null;
      try {
        _dimension = joola.common.extend(value, payload);
        _dimension = new Proto(_dimension);
      } catch (ex) {
        return callback(ex);
      }

      joola.config.set('workspaces:' + workspace + ':collections:' + collection + ':' + dimension, _dimension, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(err, _dimension);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the dimension to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes an dimension described in `options`:
 * - `name` of the dimension to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted dimension.
 *
 * Configuration elements participating: `config:dimensions`.
 *
 * Events raised via `dispatch`: `dimensions:delete-request`, `dimensions:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-dimension'
 * };
 *
 * joola.dispatch.dimensions.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/dimensions/delete",
  description: "I delete an existing dimension",
  inputs: ['workspace', 'collection', 'dimension'],
  _outputExample: {},
  _permission: ['dimensions:delete'],
  _dispatch: {
    message: 'dimensions:delete'
  },
  run: function (context, workspace, collection, dimension, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, collection, dimension, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('workspaces:' + workspace + ':collections:' + collection + ':' + dimension, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(null, {});
      });
    });
  }
};