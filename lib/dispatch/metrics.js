/**
 *  @title joola/lib/dispatch/metrics
 *  @overview Provides metric management as part of user management.
 *  @description
 *  joola uses the concept of `metric` to bind users together into a groups. metrics are logical business
 *  entities and provide the developer/user with the ability to manage permissions and filters, based not only on users
 *  and roles, but also on an metric level.
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
  Proto = require('./prototypes/metric');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined metrics:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured metrics.
 *
 * Configuration elements participating: `config:metrics`.
 *
 * Events raised via `dispatch`: `metrics:list-request`, `metrics:list-done`
 *
 * ```js
 * joola.dispatch.metrics.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/metrics/list",
  description: "I list all available metrics",
  inputs: {required: ['workspace'], optional: ['collection']},
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['metrics:list'],
  _dispatch: {
    message: 'metrics:list'
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

        return callback(null, joola.common.obj2array(_collection.metrics));
      });
    }
    else {
      joola.dispatch.collections.list(context, workspace, function (err, collections) {
        if (err)
          return callback(err);

        var calls = [];
        var metrics = [];
        collections.forEach(function (collection) {
          var call = function (cb) {
            joola.dispatch.collections.get(context, workspace, collection.key, function (err, _collection) {
              if (err)
                return cb(err);

              _collection.metrics.forEach(function (m, i) {
                _collection.metrics[i].collection = _collection.key;
              });
              return cb(null, _collection.metrics);
            });
          };
          calls.push(call);
        });
        async.parallel(calls, function (err, results) {
          if (err)
            return callback(err);

          results.forEach(function (result) {
            metrics = metrics.concat(result);
          });
          return callback(null, metrics);
        });
      });
    }
  }
};

/**
 * @function get
 * @param {string} name holds the name of the metric to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `name` of the metric
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested username.
 *
 * Configuration elements participating: `config:metrics`.
 *
 * Events raised via `dispatch`: `metrics:get-request`, `metrics:get-done`
 *
 * ```js
 * joola.dispatch.metrics.get('test-metric', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/metrics/get",
  description: "I get a specific metric by key`",
  inputs: ['workspace', 'collection', 'key'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['metrics:get'],
  _dispatch: {
    message: 'metrics:get'
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

      var result = _.filter(_collection.metrics, function (item) {
        return item.key === key;
      });

      if (!result || typeof result === 'undefined' || result === null || result.length === 0)
        return callback(new Error('metric [' + key + '] does not exist.'));

      return callback(null, result[0]);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new metric
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `name` of the new metric
 * - `filter` to apply on metric members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added metric.
 *
 * Configuration elements participating: `config:metrics`.
 *
 * Events raised via `dispatch`: `metrics:add-request`, `metrics:add-done`
 *
 * ```js
 * var options = {
 *   name: 'test-metric',
 *   filter: 'Country=France'
 * };
 *
 * joola.dispatch.metrics.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/metrics/add",
  description: "I add a new metric",
  inputs: ['workspace', 'collection', 'metric' ],
  _outputExample: {},
  _permission: ['metrics:add'],
  _dispatch: {
    message: 'metrics:add'
  },
  run: function (context, workspace, collection, metric, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    metric.type = 'metric';
    try {
      metric = new Proto(metric);
    } catch (ex) {
      return callback(ex);
    }

    exports.get.run(context, workspace, collection, metric.key, function (err, _metric) {
      if (!err) {
        return callback(new Error('metric [' + metric.key + '] already exists: ' + err));
      }

      joola.config.set('workspaces:' + workspace + ':collections:' + collection + ':' + metric.key, metric, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(null, metric);
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the metric to update and the new details
 * @param {Function} [callback] called following execution with errors and results.
 * Updates an existing user described in `options`:
 * - `name` name of the metric (cannot be updated).
 * - `_filter` filter to be applied on metric's members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated metric.
 *
 * Configuration elements participating: `config:metrics`.
 *
 * Events raised via `dispatch`: `metrics:update-request`, `metrics:update-done`
 *
 * ```js
 * var options = {
 *   name: 'test-metric',
 *   _filter: 'Country=France'
 * };
 *
 * joola.dispatch.metrics.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.patch = {
  name: "/metrics/patch",
  description: "I patch an existing metric",
  inputs: ['workspace', 'collection', 'metric', 'payload'],
  _outputExample: {},
  _permission: ['metrics:patch'],
  _dispatch: {
    message: 'metrics:patch'
  },
  run: function (context, workspace, collection, metric, payload, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, collection, metric, function (err, value) {
      if (err)
        return callback(err);

      var _metric = null;
      try {
        _metric = joola.common.extend(value, payload);
        _metric = new Proto(_metric);
      } catch (ex) {
        return callback(ex);
      }

      joola.config.set('workspaces:' + workspace + ':collections:' + collection + ':' + metric, _metric, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(err, _metric);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the metric to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes an metric described in `options`:
 * - `name` of the metric to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted metric.
 *
 * Configuration elements participating: `config:metrics`.
 *
 * Events raised via `dispatch`: `metrics:delete-request`, `metrics:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-metric'
 * };
 *
 * joola.dispatch.metrics.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/metrics/delete",
  description: "I delete an existing metric",
  inputs: ['workspace', 'collection', 'metric'],
  _outputExample: {},
  _permission: ['metrics:delete'],
  _dispatch: {
    message: 'metrics:delete'
  },
  run: function (context, workspace, collection, metric, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, collection, metric, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('workspaces:' + workspace + ':collections:' + collection + ':' + metric, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(null, {});
      });
    });
  }
};