/**
 *  @title joola.io/lib/dispatch/datatables
 *  @overview Provides datatable functionality across the framework.
 *  @description
 *  The `datatables` dispatch manages the entire flow relating to datatables, for example: listing or adding a datatable.
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
  Proto = require('./prototypes/datatable');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all configured data tables:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured datatable.
 *
 * Configuration elements participating: `config:datatables`.
 *
 * Events raised via `dispatch`: `datatables:list-request`, `datatables:list-done`
 *
 * ```js
 * joola.dispatch.datatables.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/api/datatables/list",
  description: "I list all available data tables",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('datatables:list-request', function () {
      joola.logger.debug('Listing data tables');
      self.run(function (err, value) {
        if (err)
          return joola.dispatch.emit('datatables:list-done', {err: err});

        joola.dispatch.emit('datatables:list-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    joola.dispatch.emitWait('datatables:list-request', {}, function (err, datatables) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to list datatables: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

      return router.responseSuccess(datatables, req, res);
    });
  },
  run: function (callback) {
    callback = callback || emptyfunc;
    joola.config.get('datatables', function (err, value) {
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
 * @param {string} name holds the data table name to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific data table by name:
 * - `name` of the data table
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested datatable.
 *
 * Configuration elements participating: `config:datatables`.
 *
 * Events raised via `dispatch`: `datatables:get-request`, `datatables:get-done`
 *
 * ```js
 * joola.dispatch.datatables.get('Test data table', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/api/datatables/get",
  description: "I get a specific data table by name",
  inputs: ['name'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('datatables:get-request', function (channel, name) {
      joola.logger.debug('Getting data table');
      self.run(name, function (err, value) {
        if (err)
          return joola.dispatch.emit('datatables:get-done', {err: err});

        joola.dispatch.emit('datatables:get-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    joola.dispatch.emitWait('datatables:get-request', req.params.name, function (err, datatable) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to get datatable: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

      return router.responseSuccess(datatable, req, res);
    });
  },
  run: function (name, callback) {
    callback = callback || emptyfunc;
    joola.config.get('datatables:' + name, function (err, value) {
      if (err)
        return callback(err);

      if (!value)
        return callback(new Error('datatable [' + name + '] does not exist.'));
      return callback(null, value);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new data table
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data table described in `options`:
 * - `name` of the new data table
 * - `type` of the new data table
 * - `connectionString` for the new data table
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added datatable.
 *
 * Configuration elements participating: `config:datatables`.
 *
 * Events raised via `dispatch`: `datatables:add-request`, `datatables:add-done`
 *
 * ```js
 * var options = {
 *   name: 'new datatable',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datatables.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/api/datatables/add",
  description: "I add a new data table",
  inputs: ['datatable'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('datatables:add-request', function (channel, dt) {
      joola.logger.debug('New datatable request [' + dt.name + ']');
      self.run(dt, function (err, value) {
        if (err)
          return joola.dispatch.emit('datatables:add-done', {err: err});

        joola.dispatch.emit('datatables:add-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    try {
      var dt = {
        id: req.params.datatable.id,
        name: req.params.datatable.name,
        type: req.params.datatable.type,
        primaryKey: req.params.datatable.primaryKey,
        dateColumn: req.params.datatable.dateColumn,
        dimensions: req.params.datatable.dimensions,
        metrics: req.params.datatable.metrics
      };

      joola.dispatch.emitWait('datatables:add-request', dt, function (err, _dt) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to store new datatable: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
        return router.responseSuccess(_dt, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (datatable, callback) {
    callback = callback || emptyfunc;

    try {
      datatable = new Proto(datatable);
    } catch (ex) {
      return callback(ex);
    }

    joola.config.get('datatables', function (err, value) {
      if (err)
        return callback(err);

      var _datatables;
      if (!value)
        _datatables = {};
      else
        _datatables = value;

      if (_datatables[datatable.name])
        return callback(new Error('A data table with name [' + datatable.name + '] already exists.'));
      _datatables[datatable.name] = datatable;
      joola.config.set('datatables', _datatables, function (err) {
        if (err)
          return callback(err);

        return callback(err, datatable);
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the data table with updated information
 * @param {Function} [callback] called following execution with errors and results.
 * Updates a data table described in `options`:
 * - `name` of the data table to update
 * - the updated `type` of the updated data table
 * - the updated `connectionString` for the data table
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated datatable.
 *
 * Configuration elements participating: `config:datatables`.
 *
 * Events raised via `dispatch`: `datatables:update-request`, `datatables:update-done`
 *
 * ```js
 * var options = {
 *   name: 'existing datatable',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datatables.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.update = {
  name: "/api/datatables/update",
  description: "I update an existing data table",
  inputs: ['datatable'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('datatables:update-request', function (channel, dt) {
      joola.logger.debug('datatable update request [' + dt.name + ']');
      self.run(dt, function (err, value) {
        if (err)
          return joola.dispatch.emit('datatables:update-done', {err: err});

        joola.dispatch.emit('datatables:update-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    try {
      var dt = {
        id: req.params.datatable.id,
        name: req.params.datatable.name,
        type: req.params.datatable.type,
        primaryKey: req.params.datatable.primaryKey,
        dateColumn: req.params.datatable.dateColumn,
        dimensions: req.params.datatable.dimensions,
        metrics: req.params.datatable.metrics
      };

      joola.dispatch.emitWait('datatables:update-request', dt, function (err, _dt) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to update datatable: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
        return router.responseSuccess(_dt, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (datatable, callback) {
    callback = callback || emptyfunc;

    try {
      datatable = new Proto(datatable);
    } catch (ex) {
      return callback(ex);
    }
    joola.config.get('datatables', function (err, value) {
      if (err)
        return callback(err);

      var _datatables;
      if (!value)
        _datatables = {};
      else
        _datatables = value;
      _datatables[datatable.name] = datatable;

      console.log(_datatables);
      joola.config.set('datatables', _datatables, function (err) {
        if (err)
          return callback(err);

        return callback(err, datatable);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the data table to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes a data table described in `options`:
 * - `name` of the data table to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted datatable.
 *
 * Configuration elements participating: `config:datatables`.
 *
 * Events raised via `dispatch`: `datatables:delete-request`, `datatables:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'existing datatable',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datatables.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/api/datatables/delete",
  description: "I delete an existing data table",
  inputs: ['datatable'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('datatables:delete-request', function (channel, dt) {
      joola.logger.debug('datatable delete request [' + dt.name + ']');
      self.run(dt, function (err, value) {
        if (err)
          return joola.dispatch.emit('datatables:delete-done', {err: err});

        joola.dispatch.emit('datatables:delete-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    try {
      var dt = req.params.datatable;

      joola.dispatch.emitWait('datatables:delete-request', dt, function (err, _dt) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to delete datatable: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
        return router.responseSuccess(_dt, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (datatable, callback) {
    callback = callback || emptyfunc;

    exports.get.run(datatable.name, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('datatables:' + datatable.name, function (err) {
        if (err)
          return callback(err);

        joola.config.get('datatables:' + datatable.name, function (err, value) {
          if (err)
            return callback(err);
          if (!value)
            return callback(null, datatable);

          return callback(new Error('Failed to delete data table [' + datatable.name + '].'));
        });
      });
    });
  }
};