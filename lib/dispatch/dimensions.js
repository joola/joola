/**
 *  @title joola.io/lib/dispatch/dimensions
 *  @overview Provides dimension functionality across the framework.
 *  @description
 *  The `dimensions` dispatch manages the entire flow relating to dimensions, for example: listing or adding a dimension.
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
  Proto = require('./prototypes/dimension');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all configured dimensions:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured dimension.
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
  name: "/api/dimensions/list",
  description: "I list all available dimensions",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('dimensions:list-request', function () {
      joola.logger.debug('Listing dimensions');
      self.run(function (err, value) {
        if (err)
          return joola.dispatch.emit('dimensions:list-done', {err: err});

        joola.dispatch.emit('dimensions:list-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    joola.dispatch.emitWait('dimensions:list-request', {}, function (err, dimensions) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to list dimensions: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

      return router.responseSuccess(dimensions, req, res);
    });
  },
  run: function (callback) {
    callback = callback || emptyfunc;
    joola.config.get('dimensions', function (err, value) {
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
 * @param {string} name holds the dimension name to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific dimension by name:
 * - `name` of the dimension
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested dimension.
 *
 * Configuration elements participating: `config:dimensions`.
 *
 * Events raised via `dispatch`: `dimensions:get-request`, `dimensions:get-done`
 *
 * ```js
 * joola.dispatch.dimensions.get('Test dimension', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/api/dimensions/get",
  description: "I get a specific dimension by name",
  inputs: ['name'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('dimensions:get-request', function (channel, name) {
      joola.logger.debug('Getting dimension');
      self.run(name, function (err, value) {
        if (err)
          return joola.dispatch.emit('dimensions:get-done', {err: err});

        joola.dispatch.emit('dimensions:get-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    joola.dispatch.emitWait('dimensions:get-request', req.params.name, function (err, dimension) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to get dimension: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

      return router.responseSuccess(dimension, req, res);
    });
  },
  run: function (name, callback) {
    callback = callback || emptyfunc;
    joola.config.get('dimensions:' + name, function (err, value) {
      if (err)
        return callback(err);

      if (!value)
        return callback(new Error('dimension [' + name + '] does not exist.'));
      return callback(null, value);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new dimension
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new dimension described in `options`:
 * - `name` of the new dimension
 * - `type` of the new dimension
 * - `connectionString` for the new dimension
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
 *   name: 'new dimension',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.dimensions.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/api/dimensions/add",
  description: "I add a new dimension",
  inputs: ['dimension'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('dimensions:add-request', function (channel, dt) {
      joola.logger.debug('New dimension request [' + dt.name + ']');
      self.run(dt, function (err, value) {
        if (err)
          return joola.dispatch.emit('dimensions:add-done', {err: err});

        joola.dispatch.emit('dimensions:add-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    try {
      var dt = {
        datatable: req.params.dimension.datatable,
        id: req.params.dimension.id,
        name: req.params.dimension.name,
        description: req.params.dimension.description,
        type: req.params.dimension.type,
        virtual: req.params.dimension.virtual,
        visible: req.params.dimension.visible,
        deleted: req.params.dimension.deleted,
        column: req.params.dimension.column,
        parent: req.params.dimension.parent,
        roles: req.params.dimension.roles
      };

      joola.dispatch.emitWait('dimensions:add-request', dt, function (err, _dt) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to store new dimension: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
        return router.responseSuccess(_dt, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (dimension, callback) {
    callback = callback || emptyfunc;

    try {
      dimension = new Proto(dimension);
    } catch (ex) {
      return callback(ex);
    }

    joola.config.get('dimensions', function (err, value) {
      if (err)
        return callback(err);

      var _dimensions;
      if (!value)
        _dimensions = {};
      else
        _dimensions = value;

      if (_dimensions[dimension.name])
        return callback(new Error('A dimension with name [' + dimension.name + '] already exists.'));
      _dimensions[dimension.name] = dimension;
      joola.config.set('dimensions', _dimensions, function (err) {
        if (err)
          return callback(err);

        joola.dispatch.datatables.get(dimension.datatable, function (err, dt) {
          if (err)
            return callback(err);

          dt.dimensions[dimension.id] = dimension;
          joola.dispatch.datatables.update(dt, function (err, dt) {
            console.log(dt);
            return callback(err, dimension);
          });
        });
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the dimension with updated information
 * @param {Function} [callback] called following execution with errors and results.
 * Updates a dimension described in `options`:
 * - `name` of the dimension to update
 * - the updated `type` of the updated dimension
 * - the updated `connectionString` for the dimension
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
 *   name: 'existing dimension',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.dimensions.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.update = {
  name: "/api/dimensions/update",
  description: "I update an existing dimension",
  inputs: ['dimension'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('dimensions:update-request', function (channel, dt) {
      joola.logger.debug('dimension update request [' + dt.name + ']');
      self.run(dt, function (err, value) {
        if (err)
          return joola.dispatch.emit('dimensions:update-done', {err: err});

        joola.dispatch.emit('dimensions:update-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    try {
      var dt = {
        datatable: req.params.dimension.datatable,
        id: req.params.dimension.id,
        name: req.params.dimension.name,
        description: req.params.dimension.description,
        type: req.params.dimension.type,
        virtual: req.params.dimension.virtual,
        visible: req.params.dimension.visible,
        deleted: req.params.dimension.deleted,
        column: req.params.dimension.column,
        parent: req.params.dimension.parent,
        roles: req.params.dimension.roles
      };

      joola.dispatch.emitWait('dimensions:update-request', dt, function (err, _dt) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to update dimension: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
        return router.responseSuccess(_dt, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (dimension, callback) {
    callback = callback || emptyfunc;

    try {
      dimension = new Proto(dimension);
    } catch (ex) {
      return callback(ex);
    }
    joola.config.get('dimensions', function (err, value) {
      if (err)
        return callback(err);

      var _dimensions;
      if (!value)
        _dimensions = {};
      else
        _dimensions = value;
      _dimensions[dimension.name] = dimension;

      joola.config.set('dimensions', _dimensions, function (err) {
        if (err)
          return callback(err);

        joola.dispatch.datatables.get(dimension.datatable, function (err, dt) {
          if (err)
            return callback(err);

          dt.dimensions[dimension.id] = dimension;
          return callback(err, dimension);
        });
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the dimension to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes a dimension described in `options`:
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
 *   name: 'existing dimension',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.dimensions.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/api/dimensions/delete",
  description: "I delete an existing dimension",
  inputs: ['dimension'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('dimensions:delete-request', function (channel, dt) {
      joola.logger.debug('dimension delete request [' + dt.name + ']');
      self.run(dt, function (err, value) {
        if (err)
          return joola.dispatch.emit('dimensions:delete-done', {err: err});

        joola.dispatch.emit('dimensions:delete-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    try {
      var dt = req.params.dimension;

      joola.dispatch.emitWait('dimensions:delete-request', dt, function (err, _dt) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to delete dimension: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
        return router.responseSuccess(_dt, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (dimension, callback) {
    callback = callback || emptyfunc;

    exports.get.run(dimension.name, function (err, value) {
      if (err)
        return callback(err);

      dimension = value;

      joola.config.clear('dimensions:' + dimension.name, function (err) {
        if (err)
          return callback(err);

        joola.config.get('dimensions:' + dimension.name, function (err, value) {
          if (err)
            return callback(err);
          if (!value) {
            joola.dispatch.datatables.get(dimension.datatable, function (err, dt) {
              if (err)
                return callback(err);

              delete dt.dimensions[dimension.id];
              return callback(err, dimension);
            });
          }
          else
            return callback(new Error('Failed to delete dimension [' + dimension.name + '].'));
        });
      });
    });
  }
};