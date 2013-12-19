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
  dispatch: function () {
    var self = this;
    joola.dispatch.on('metrics:list-request', function () {
      joola.logger.debug('Listing metrics');
      self.run(function (err, value) {
        if (err)
          return joola.dispatch.emit('metrics:list-done', {err: err});

        joola.dispatch.emit('metrics:list-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    joola.dispatch.emitWait('metrics:list-request', {}, function (err, metrics) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to list metrics: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

      return router.responseSuccess(metrics, req, res);
    });
  },
  run: function (callback) {
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
  dispatch: function () {
    var self = this;
    joola.dispatch.on('metrics:get-request', function (channel, name) {
      joola.logger.debug('Getting metric');
      self.run(name, function (err, value) {
        if (err)
          return joola.dispatch.emit('metrics:get-done', {err: err});

        joola.dispatch.emit('metrics:get-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    joola.dispatch.emitWait('metrics:get-request', req.params.name, function (err, metric) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to get metric: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

      return router.responseSuccess(metric, req, res);
    });
  },
  run: function (name, callback) {
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
  dispatch: function () {
    var self = this;
    joola.dispatch.on('metrics:add-request', function (channel, dt) {
      joola.logger.debug('New metric request [' + dt.name + ']');
      self.run(dt, function (err, value) {
        if (err)
          return joola.dispatch.emit('metrics:add-done', {err: err});

        joola.dispatch.emit('metrics:add-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    try {
      var dt = {
        datatable: req.params.metric.datatable,
        dimension: req.params.metric.dimension,
        metric: req.params.metric.metric,
        id: req.params.metric.id,
        name: req.params.metric.name,
        description: req.params.metric.description,
        type: req.params.metric.type,
        virtual: req.params.metric.virtual,
        visible: req.params.metric.visible,
        deleted: req.params.metric.deleted,
        column: req.params.metric.column,
        aggregation: req.params.metric.aggregation,
        prefix: req.params.metric.prefix,
        suffix: req.params.metric.suffix,
        formula: req.params.metric.formula,
        ratiodirection: req.params.metric.ratiodirection,
        roles: req.params.metric.roles,
        category: req.params.metric.category
      };

      joola.dispatch.emitWait('metrics:add-request', dt, function (err, _dt) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to store new metric: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
        return router.responseSuccess(_dt, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (metric, callback) {
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
            console.log(dt);
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
  dispatch: function () {
    var self = this;
    joola.dispatch.on('metrics:update-request', function (channel, dt) {
      joola.logger.debug('metric update request [' + dt.name + ']');
      self.run(dt, function (err, value) {
        if (err)
          return joola.dispatch.emit('metrics:update-done', {err: err});

        joola.dispatch.emit('metrics:update-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    try {
      var dt = {
        datatable: req.params.metric.datatable,
        dimension: req.params.metric.dimension,
        metric: req.params.metric.metric,
        id: req.params.metric.id,
        name: req.params.metric.name,
        description: req.params.metric.description,
        type: req.params.metric.type,
        virtual: req.params.metric.virtual,
        visible: req.params.metric.visible,
        deleted: req.params.metric.deleted,
        column: req.params.metric.column,
        aggregation: req.params.metric.aggregation,
        prefix: req.params.metric.prefix,
        suffix: req.params.metric.suffix,
        formula: req.params.metric.formula,
        ratiodirection: req.params.metric.ratiodirection,
        roles: req.params.metric.roles,
        category: req.params.metric.category
      };

      joola.dispatch.emitWait('metrics:update-request', dt, function (err, _dt) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to update metric: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
        return router.responseSuccess(_dt, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (metric, callback) {
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
  dispatch: function () {
    var self = this;
    joola.dispatch.on('metrics:delete-request', function (channel, dt) {
      joola.logger.debug('metric delete request [' + dt.name + ']');
      self.run(dt, function (err, value) {
        if (err)
          return joola.dispatch.emit('metrics:delete-done', {err: err});

        joola.dispatch.emit('metrics:delete-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    try {
      var dt = req.params.metric;

      joola.dispatch.emitWait('metrics:delete-request', dt, function (err, _dt) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to delete metric: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
        return router.responseSuccess(_dt, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (metric, callback) {
    callback = callback || emptyfunc;

    exports.get.run(metric.name, function (err, value) {
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