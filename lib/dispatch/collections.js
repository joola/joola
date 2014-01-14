/**
 *  @title joola.io/lib/dispatch/organizations
 *  @overview Provides organization management as part of user management.
 *  @description
 *  joola.io uses the concept of `organization` to bind users together into a groups. Organizations are logical business
 *  entities and provide the developer/user with the ability to manage permissions and filters, based not only on users
 *  and roles, but also on an organization level.
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
var
  router = require('../webserver/routes/index'),
  Proto = require('./prototypes/collection');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined organizations:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured organizations.
 *
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:list-request`, `orgs:list-done`
 *
 * ```js
 * joola.dispatch.organizations.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/api/collections/list",
  description: "I list all available collections",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:list'
  },
  run: function (context, callback) {
    callback = callback || emptyfunc;
    joola.config.get('datamap:collections', function (err, value) {
      if (err) {
        return callback(err);
      }

      if (typeof value === 'undefined')
        value = {};

      return callback(null, value);
    });
  }
};

/**
 * @function get
 * @param {string} name holds the name of the organization to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `name` of the organization
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested username.
 *
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:get-request`, `orgs:get-done`
 *
 * ```js
 * joola.dispatch.organizations.get('test-org', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/api/collections/get",
  description: "I get a specific collections by id`",
  inputs: ['id'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:get'
  },
  run: function (context, id, callback) {
    callback = callback || emptyfunc;
    joola.config.get('datamap:collections:' + id, function (err, value) {
      if (err)
        return callback(err);

      if (typeof value === 'undefined')
        return callback(new Error('collections [' + id + '] does not exist.'));

      return callback(null, value);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new organization
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `name` of the new organization
 * - `filter` to apply on organization members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added organization.
 *
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:add-request`, `orgs:add-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org',
 *   filter: 'Country=France'
 * };
 *
 * joola.dispatch.organizations.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/api/collections/add",
  description: "I add a new collection",
  inputs: ['collection'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:add'
  },
  run: function (context, collection, callback) {
    callback = callback || emptyfunc;
    try {
      collection = new Proto(collection);
    } catch (ex) {
      return callback(ex);
    }
    joola.config.get('datamap:collections', function (err, value) {
      if (err)
        return callback(err);

      var _collections;
      if (!value)
        _collections = {};
      else
        _collections = value;

      if (_collections[collection.id])
        return callback(new Error('An collection with name [' + collection.id + '] already exists.'));

      _collections[collection.id] = collection;
      joola.config.set('datamap:collections', _collections, function (err) {
        if (err)
          return callback(err);

        return callback(err, collection);
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the organization to update and the new details
 * @param {Function} [callback] called following execution with errors and results.
 * Updates an existing user described in `options`:
 * - `name` name of the organization (cannot be updated).
 * - `_filter` filter to be applied on organization's members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated organization.
 *
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:update-request`, `orgs:update-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org',
 *   _filter: 'Country=France'
 * };
 *
 * joola.dispatch.organizations.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.update = {
  name: "/api/collections/update",
  description: "I update an existing collection",
  inputs: ['collection'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:update'
  },
  run: function (context, collection, callback) {
    callback = callback || emptyfunc;

    try {
      collection = new Proto(collection);
    } catch (ex) {
      return callback(ex);
    }

    joola.config.get('datamap:collections', function (err, value) {
      if (err)
        return callback(err);

      var _collections;
      if (!value)
        _collections = {};
      else
        _collections = value;

      if (!_collections.hasOwnProperty(collection.id))
        return callback(new Error('collection with name [' + collection.id + '] does not exist.'));
      _collections[collection.id] = org;
      joola.config.set('datamap:collections', _collections, function (err) {
        if (err)
          return callback(err);

        return callback(err, collection);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the organization to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes an organization described in `options`:
 * - `name` of the organization to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted organization.
 *
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:delete-request`, `orgs:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org'
 * };
 *
 * joola.dispatch.organizations.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/api/collections/delete",
  description: "I delete an existing collection",
  inputs: ['id'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:delete'
  },
  run: function (context, id, callback) {
    callback = callback || emptyfunc;

    exports.get.run(context, id, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('datamap:collections:' + id, function (err) {
        if (err)
          return callback(err);

        joola.config.get('datamap:collections:' + id, function (err, value) {
          if (err)
            return callback(err);
          if (!value || !value.hasOwnProperty('id'))
            return callback(null, id);

          return callback(new Error('Failed to delete collection [' + id + '].'));
        });
      });
    });
  }
};


/**
 * @function delete
 * @param {Object} options describes the organization to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes an organization described in `options`:
 * - `name` of the organization to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted organization.
 *
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:delete-request`, `orgs:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org'
 * };
 *
 * joola.dispatch.organizations.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.stats = {
  name: "/api/collections/stats",
  description: "I provide stats about a collection",
  inputs: ['id'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:stats'
  },
  run: function (context, id, callback) {
    callback = callback || emptyfunc;

    exports.get.run(context, id, function (err, value) {
      if (err)
        return callback(err);

      joola.mongo.collection('cache', id, function (err, collection) {
        collection.stats(callback);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the organization to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes an organization described in `options`:
 * - `name` of the organization to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted organization.
 *
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:delete-request`, `orgs:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org'
 * };
 *
 * joola.dispatch.organizations.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.maxdate = {
  name: "/api/collections/maxdate",
  description: "I provide the maximum date available in the collection",
  inputs: {
    required: ['id'],
    optional: ['key']
  },
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:maxdate'
  },
  run: function (context, id, key, callback) {
    if (typeof key === 'function') {
      callback = key;
      key = null;
    }

    exports.get.run(context, id, function (err, value) {
      if (err)
        return callback(err);

      var sortKey = {};
      sortKey[key ? key : 'timestamp'] = -1;
      joola.mongo.find('cache', id, {}, {limit: 1, sort: sortKey}, function (err, result) {
        if (err)
          return callback(err)

        return callback(null, result && result[0] && result[0].timestamp ? new Date(result[0].timestamp) : null);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the organization to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes an organization described in `options`:
 * - `name` of the organization to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted organization.
 *
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:delete-request`, `orgs:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org'
 * };
 *
 * joola.dispatch.organizations.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.mindate = {
  name: "/api/collections/mindate",
  description: "I provide the minimum date available in the collection",
  inputs: {
    required: ['id'],
    optional: ['key']
  },
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:mindate'
  },
  run: function (context, id, key, callback) {
    if (typeof key === 'function') {
      callback = key;
      key = null;
    }
    callback = callback || emptyfunc;

    exports.get.run(context, id, function (err, value) {
      if (err)
        return callback(err);

      var sortKey = {};
      sortKey[key ? key : 'timestamp'] = 1;
      joola.mongo.find('cache', id, {}, {limit: 1, sort: sortKey}, function (err, result) {
        if (err)
          return callback(err)

        return callback(null, result && result[0] && result[0].timestamp ? new Date(result[0].timestamp) : null);
      });
    });
  }
};