/**
 *  @title joola.io/lib/dispatch/datasources
 *  @overview Provides datasource functionality across the framework.
 *  @description
 *  The `datasources` dispatch manages the entire flow relating to datasources, for example: listing or adding a datasource.
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
  proto = require('./prototypes/datasource');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all configured data sources:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured datasource.
 *
 * Configuration elements participating: `config:datasources`.
 *
 * Events raised via `dispatch`: `datasources:list-request`, `datasources:list-done`
 *
 * ```js
  * joola.dispatch.datasources.list(function(err, result) {
 * 	console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/api/datasources/list",
  description: "I list all available data sources",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('datasources:list-request', function () {
      joola.logger.debug('Listing data sources');
      self.run(function (err, value) {
        if (err)
          return joola.dispatch.emit('datasources:list-done', {err: err});

        joola.dispatch.emit('datasources:list-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    var response = {};
    joola.dispatch.emitWait('datasources:list-request', {}, function (err, datasources) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to list datasources: ' + err), req, res);

      response.datasources = datasources;
      return router.responseSuccess(response, req, res);
    });
  },
  run: function (callback) {
    callback = callback || emptyfunc;
    joola.config.get('datasources', function (err, value) {
      if (err)
        return callback(err);

      if (typeof value === 'undefined')
        value = {};

      return callback(null, value);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new data source
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `name` of the new data source
 * - `type` of the new data source
 * - `connectionString` for the new data source
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added datasource.
 *
 * Configuration elements participating: `config:datasources`.
 *
 * Events raised via `dispatch`: `datasources:add-request`, `datasources:add-done`
 *
 * ```js
 * var options = {
 * 	name: 'new datasource',
 * 	type: 'MySQL',
 * 	connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datasources.add(options, function(err, result) {
 * 	console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/api/datasources/add",
  description: "I add a new data source",
  inputs: ['datasource'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('datasources:add-request', function (channel, ds) {
      joola.logger.debug('New datasource request [' + ds.name + ']');
      self.run(ds, function (err, value) {
        if (err)
          return joola.dispatch.emit('datasources:add-done', {err: err});

        joola.dispatch.emit('datasources:add-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    var response = {};
    try {
      var ds = new proto({
        name: req.params.datasource.name,
        type: req.params.datasource.type,
        _connectionString: req.params.datasource._connectionString,
        stam: req.params.datasource.stam
      });

      joola.dispatch.emitWait('datasources:add-request', ds, function (err, _ds) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to store new datasource: ' + err), req, res);
        return router.responseSuccess(_ds, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (datasource, callback) {
    callback = callback || emptyfunc;

    joola.config.get('datasources', function (err, value) {
      if (err)
        return callback(err);

      var _datasources;
      if (!value)
        _datasources = {};
      else
        _datasources = value;
      _datasources[datasource.name] = datasource;
      joola.config.set('datasources', _datasources, function (err) {
        if (err)
          return callback(err);

        return callback(err, datasource);
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the data source with updated information
 * @param {Function} [callback] called following execution with errors and results.
 * Updates a data source described in `options`:
 * - `name` of the data source to update
 * - the updated `type` of the updated data source
 * - the updated `connectionString` for the data source
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated datasource.
 *
 * Configuration elements participating: `config:datasources`.
 *
 * Events raised via `dispatch`: `datasources:update-request`, `datasources:update-done`
 *
 * ```js
 * var options = {
 * 	name: 'existing datasource',
 * 	type: 'MySQL',
 * 	connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datasources.update(options, function(err, result) {
 * 	console.log(err, result);
 * }
 * ```
 */
exports.update = {
  name: "/api/datasources/update",
  description: "I update an existing data source",
  inputs: ['datasource'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('datasources:update-request', function (channel, ds) {
      joola.logger.debug('datasource update request [' + ds.name + ']');
      self.run(ds, function (err, value) {
        if (err)
          return joola.dispatch.emit('datasources:update-done', {err: err});

        joola.dispatch.emit('datasources:update-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    var response = {};
    try {
      var ds = new proto({
        name: req.params.datasource.name,
        type: req.params.datasource.type,
        _connectionString: req.params.datasource._connectionString,
        stam: req.params.datasource.stam
      });

      joola.dispatch.emitWait('datasources:update-request', ds, function (err, _ds) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to update datasource: ' + err), req, res);
        return router.responseSuccess(_ds, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (datasource, callback) {
    callback = callback || emptyfunc;

    joola.config.get('datasources', function (err, value) {
      if (err)
        return callback(err);

      var _datasources;
      if (!value)
        _datasources = {};
      else
        _datasources = value;
      _datasources[datasource.name] = datasource;

      joola.config.set('datasources', _datasources, function (err) {
        if (err)
          return callback(err);

        return callback(err, datasource);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the data source to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes a data source described in `options`:
 * - `name` of the data source to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted datasource.
 *
 * Configuration elements participating: `config:datasources`.
 *
 * Events raised via `dispatch`: `datasources:delete-request`, `datasources:delete-done`
 *
 * ```js
 * var options = {
 * 	name: 'existing datasource',
 * 	type: 'MySQL',
 * 	connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datasources.delete(options, function(err, result) {
 * 	console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/api/datasources/delete",
  description: "I delete an existing data source",
  inputs: ['datasource'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('datasources:delete-request', function (channel, ds) {
      joola.logger.debug('datasource delete request [' + ds.name + ']');
      self.run(ds, function (err, value) {
        if (err)
          return joola.dispatch.emit('datasources:delete-done', {err: err});

        joola.dispatch.emit('datasources:delete-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    var response = {};
    try {
      var ds = new proto({
        name: req.params.datasource.name,
        type: req.params.datasource.type,
        _connectionString: req.params.datasource._connectionString,
        stam: req.params.datasource.stam
      });

      joola.dispatch.emitWait('datasources:delete-request', ds, function (err, _ds) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to delete datasource: ' + err), req, res);
        response.ds = _ds;
        return router.responseSuccess(response, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (datasource, callback) {
    callback = callback || emptyfunc;

    joola.config.get('datasources', function (err, value) {
      if (err)
        return callback(err);

      joola.config.redis.expire('datasources:' + datasource.name, 1);
      /*joola.config.set('datasources', _datasources, function (err) {
       if (err)
       joola.dispatch.emit('datasources:delete-done', {err: err});
       else
       joola.dispatch.emit('datasources:delete-done', {err: null, message: datasource});

       return callback(err, datasource);
       });*/
      return callback(err, datasource);
    });
  }
};