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
  Proto = require('./prototypes/datasource');

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
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/api/datasources/list",
  description: "I list all available data sources",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'datasources:list'
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
 * @function get
 * @param {string} name holds the data source name to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific data source by name:
 * - `name` of the data source
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested datasource.
 *
 * Configuration elements participating: `config:datasources`.
 *
 * Events raised via `dispatch`: `datasources:get-request`, `datasources:get-done`
 *
 * ```js
 * joola.dispatch.datasources.get('Test Data Source', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/api/datasources/get",
  description: "I get a specific data source by name",
  inputs: ['name'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'datasources:get'
  },
  run: function (name, callback) {
    callback = callback || emptyfunc;
    joola.config.get('datasources:' + name, function (err, value) {
      if (err)
        return callback(err);

      if (!value)
        return callback(new Error('Datasource [' + name + '] does not exist.'));
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
 *   name: 'new datasource',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datasources.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/api/datasources/add",
  description: "I add a new data source",
  inputs: ['datasource'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'datasources:add'
  },
  run: function (datasource, callback) {
    callback = callback || emptyfunc;

    try {
      datasource = new Proto(datasource);
    } catch (ex) {
      return callback(ex);
    }

    joola.config.get('datasources', function (err, value) {
      if (err)
        return callback(err);

      var _datasources;
      if (!value)
        _datasources = {};
      else
        _datasources = value;

      if (_datasources[datasource.name])
        return callback(new Error('A data source with name [' + datasource.name + '] already exists.'));
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
 *   name: 'existing datasource',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datasources.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.update = {
  name: "/api/datasources/update",
  description: "I update an existing data source",
  inputs: ['datasource'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'datasources:update'
  },
  run: function (datasource, callback) {
    callback = callback || emptyfunc;

    try {
      datasource = new Proto(datasource);
    } catch (ex) {
      return callback(ex);
    }
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
 *   name: 'existing datasource',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datasources.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/api/datasources/delete",
  description: "I delete an existing data source",
  inputs: ['datasource'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'datasources:delete'
  },
  run: function (datasource, callback) {
    callback = callback || emptyfunc;

    exports.get.run(datasource.name, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('datasources:' + datasource.name, function (err) {
        if (err)
          return callback(err);

        joola.config.get('datasources:' + datasource.name, function (err, value) {
          if (err)
            return callback(err);
          if (!value)
            return callback(null, datasource);

          return callback(new Error('Failed to delete data source [' + datasource.name + '].'));
        });
      });
    });
  }
};

/**
 * @function validate
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
 *   name: 'existing datasource',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datasources.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.validate = {
  name: "/api/datasources/validate",
  description: "I validate an existing data source",
  inputs: ['datasource'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'datasources:verify'
  },
  run: function (datasource, callback) {
    callback = callback || emptyfunc;

    exports.get.run(datasource, function (err, value) {
      if (err)
        return callback(err);

      if (!joola.connectors[value.type])
        return new Error('Data source has invalid connector assigned [' + value.type + ']');

      datasource = value;
      var connector = joola.connectors[value.type];
      connector.validate(datasource, function (err, validated) {
        if (err)
          return callback(err);

        return callback(null, {valid: validated});
      });
    });
  }
};

/**
 * @function validateRaw
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
 *   name: 'existing datasource',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datasources.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.validateRaw = {
  name: "/api/datasources/validateRaw",
  description: "I validate a data source by connection details",
  inputs: ['type', 'dbhost', 'dbport', 'dbuser', 'dbpass', 'dbname'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'datasources:validateRaw'
  },
  run: function (type, dbhost, dbport, dbuser, dbpass, dbname, callback) {
    callback = callback || emptyfunc;
    if (!joola.connectors[type])
      return new Error('Data source has invalid connector assigned [' + value.type + ']');

    var connector = joola.connectors[type];

    var datasource = {
      type: type,
      dbhost: dbhost,
      dbport: dbport,
      dbuser: dbuser,
      dbpass: dbpass,
      dbname: dbname
    };

    connector.validate(datasource, function (err, validated) {
      if (err)
        return callback(err);

      return callback(null, {valid: validated});
    });
  }
};

/**
 * @function validateRaw
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
 *   name: 'existing datasource',
 *   type: 'MySQL',
 *   connectionString: 'tcp://someConnectionString'
 * };
 *
 * joola.dispatch.datasources.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.meta = {
  name: "/api/datasources/meta",
  description: "I validate a data source by connection details",
  inputs: {
    required: ['datasource'],
    optional: ['object']
  },
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'datasources:meta'
  },
  run: function (datasource, object, callback) {
    if (typeof object === 'function') {
      callback = object;
      object = null;
    }

    callback = callback || emptyfunc;

    exports.get.run(datasource, function (err, value) {
      if (err)
        return callback(err);

      if (!joola.connectors[value.type])
        return new Error('Data source has invalid connector assigned [' + value.type + ']');

      datasource = value;
      var connector = joola.connectors[value.type];
      connector.meta(datasource, object, function (err, result) {
        if (err)
          return callback(err);

        return callback(null, result);
      });
    });
  }
};