/**
 *  @title joola.io/lib/dispatch/metrics
 *  @overview Provides metric functionality across the framework.
 *  @description
 *  The `metrics` dispatch manages the entire flow relating to metrics, for example: listing or adding a metric.
 *  The dispatch follows the guidelines and flow defined in [Disptach Flow](dispatch-flow).
 *
 * - [list](#list)
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
  Proto = require('./prototypes/metric');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all configured metrics:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured metric.
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
  name: "/api/metrics/list",
  description: "I list all available metrics",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'metrics:list'
  },
  run: function (context, callback) {
    callback = callback || emptyfunc;
    joola.config.get('metrics', function (err, value) {
      if (err)
        return callback(err);

      if (typeof value === 'undefined')
        value = {};

      return callback(null, value);
    });
  }
};


/**
 * @function get
 * @param {string} name holds the metric name to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific metric by name:
 * - `name` of the metric
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested metric.
 *
 * Configuration elements participating: `config:metrics`.
 *
 * Events raised via `dispatch`: `metrics:get-request`, `metrics:get-done`
 *
 * ```js
 * joola.dispatch.metrics.get('Test metric', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/api/metrics/get",
  description: "I get a specific metric by name",
  inputs: ['name'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'metrics:get'
  },
  run: function (context, name, callback) {
    callback = callback || emptyfunc;
    joola.config.get('metrics:' + name, function (err, value) {
      if (err)
        return callback(err);

      if (!value)
        return callback(new Error('metric [' + name + '] does not exist.'));
      return callback(null, value);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new metric
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new metric described in `options`:
 * - `name` of the new metric
 * - `type` of the new metric
 * - `connectionString` for the new metric
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
 *   name: 'new metric',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.metrics.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/api/metrics/add",
  description: "I add a new metric",
  inputs: ['metric'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'metrics:add'
  },
  run: function (context, metric, callback) {
    callback = callback || emptyfunc;

    try {
      metric = new Proto(metric);
    } catch (ex) {
      return callback(ex);
    }

    joola.config.get('metrics', function (err, value) {
      if (err)
        return callback(err);

      var _metrics;
      if (!value)
        _metrics = {};
      else
        _metrics = value;

      if (_metrics[metric.name])
        return callback(new Error('A metric with name [' + metric.name + '] already exists.'));
      _metrics[metric.name] = metric;
      joola.config.set('metrics', _metrics, function (err) {
        if (err)
          return callback(err);

        joola.dispatch.datatables.get(metric.datatable, function (err, dt) {
          if (err)
            return callback(err);

          dt.metrics[metric.id] = metric;
          joola.dispatch.datatables.update(dt, function (err, dt) {
            return callback(err, metric);
          });
        });
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the metric with updated information
 * @param {Function} [callback] called following execution with errors and results.
 * Updates a metric described in `options`:
 * - `name` of the metric to update
 * - the updated `type` of the updated metric
 * - the updated `connectionString` for the metric
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
 *   name: 'existing metric',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.metrics.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.update = {
  name: "/api/metrics/update",
  description: "I update an existing metric",
  inputs: ['metric'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'metrics:update'
  },
  run: function (context, metric, callback) {
    callback = callback || emptyfunc;

    try {
      metric = new Proto(metric);
    } catch (ex) {
      return callback(ex);
    }
    joola.config.get('metrics', function (err, value) {
      if (err)
        return callback(err);

      var _metrics;
      if (!value)
        _metrics = {};
      else
        _metrics = value;
      _metrics[metric.name] = metric;

      joola.config.set('metrics', _metrics, function (err) {
        if (err)
          return callback(err);

        joola.dispatch.datatables.get(metric.datatable, function (err, dt) {
          if (err)
            return callback(err);

          dt.metrics[metric.id] = metric;
          return callback(err, metric);
        });
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the metric to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes a metric described in `options`:
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
 *   name: 'existing metric',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.metrics.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/api/metrics/delete",
  description: "I delete an existing metric",
  inputs: ['metric'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'metrics:delete'
  },
  run: function (context, metric, callback) {
    callback = callback || emptyfunc;

    exports.get.run(context, metric.name, function (err, value) {
      if (err)
        return callback(err);

      metric = value;

      joola.config.clear('metrics:' + metric.name, function (err) {
        if (err)
          return callback(err);

        joola.config.get('metrics:' + metric.name, function (err, value) {
          if (err)
            return callback(err);
          if (!value) {
            joola.dispatch.datatables.get(metric.datatable, function (err, dt) {
              if (err)
                return callback(err);

              delete dt.metrics[metric.id];
              return callback(err, metric);
            });
          }
          else
            return callback(new Error('Failed to delete metric [' + metric.name + '].'));
        });
      });
    });
  }
};