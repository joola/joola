/**
 *  @title joola.collections
 *  @description
 *  joola.io uses the concept of `collections` to organize documents into logical sections.
 *  [[Collections]] include definitions on metrics, dimensions and other attributes. that instruct joola.io on how to
 *  translate the collection's data into meaningful insight.
 *
 *  Collections are part of the [Dispatch sub-system](the-dispatch-subsystem) and can be access from both the server and client side, via
 *  `joola.collections`.
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
 * Lists all defined collections:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured collections.
 *
 * Configuration elements participating: `config:datamap:collections`.
 *
 * Events raised via `dispatch`: `collections:list-request`, `collections:list-done`
 *
 * ```js
 * joola.collections.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */

var joola = require('../joola.io');

exports.list = {
  name: "/api/collections/list",
  description: "I list all available collections",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:list'
  },
  run: function (context, organization, callback) {
    callback = callback || emptyfunc;
    joola.config.get('authentication:organizations:' + organization + ':collections', function (err, value) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      return callback(null, value || {});
    });
  }
};

/**
 * @function get
 * @param {string} id holds the id of the collection to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific collection by id:
 * - `id` of the collection
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested collection.
 *
 * Configuration elements participating: `config:datamap:collections`.
 *
 * Events raised via `dispatch`: `collections:get-request`, `collections:get-done`
 *
 * ```js
 * joola.collections.get('dummyCollection', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/api/collections/get",
  description: "I get a specific collection by id`",
  inputs: ['organization', 'id'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:get'
  },
  run: function (context, organization, id, callback) {
    callback = callback || emptyfunc;
    joola.config.get('authentication:organizations:' + organization + ':collections:' + id, function (err, value) {
      /* istanbul ignore if */
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
 * @param {Object} options describes the new collection
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new collection described in `options`:
 * - `id` of the new collection.
 * - `name` of the new collection.
 * - `type` of the new collection (data/lookup).
 * - `description` of the new collection.
 * - `dimensions` contained in the new collection.
 * - `metrics` contained in the new collection.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added collection object.
 *
 * Configuration elements participating: `config:datamap:collections`.
 *
 * Events raised via `dispatch`: `collections:add-request`, `collections:add-done`
 *
 * ```js
 * var newCollection = {
 *   id: 'dummyCollection', 
 *   name: 'Dummy Collection',
 *   description: 'Dummy Collection for docs',
 *   type: 'data',
 *   dimensions: {
 *     timestamp: {
 *       id: 'timestamp',
 *       name: 'Date',
 *       mapto: 'timestamp'
 *     }
 *   },
 *   metrics: {
 *     visits: {
 *       id: 'visits',
 *       Name: 'Visits',
 *       type: 'int',
 *       aggregation: 'sum'
 *     }
 *   }
 * };
 *
 * joola.collections.add(newCollection, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/api/collections/add",
  description: "I add a new collection",
  inputs: ['organization', 'collection'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:add'
  },
  run: function (context, organization, collection, callback) {
    callback = callback || emptyfunc;
    try {
      collection = new Proto(collection);
    } catch (ex) {
      return callback(ex);
    }

    exports.get.run(context, organization, collection.id, function (err, _collection) {
      if (_collection)
        return callback(new Error('Collection already exist'));

      joola.config.set('authentication:organizations:' + organization + ':collections:' + collection.id, collection, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(err, collection);
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the collection to update and the new details
 * @param {Function} [callback] called following execution with errors and results.
 * Updates an existing user described in `options`:
 * - `id` of the collection to be updated (cannot be changed).
 * - `name` to update for the existing collection.
 * - `type` to update for the existing collection.
 * - `description` to update for the existing collection.
 * - `dimensions` to update for the existing collection.
 * - `metrics` to update for the existing collection.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated collection.
 *
 * Configuration elements participating: `config:datamap:collections`.
 *
 * Events raised via `dispatch`: `collection:update-request`, `collection:update-done`
 *
 * ```js
 * var collectionToUpdate = {
 *   id: 'dummyCollection', 
 *   name: 'Dummy Collection - updated',
 *   description: 'Dummy Collection for docs - updated',
 * };
 *
 * joola.collections.update(collectionToUpdate, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.update = {
  name: "/api/collections/update",
  description: "I update an existing collection",
  inputs: ['organization', 'collection'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:update'
  },
  run: function (context, organization, collection, callback) {
    callback = callback || emptyfunc;

    try {
      collection = new Proto(collection);
    } catch (ex) {
      return callback(ex);
    }

    exports.get.run(context, organization, collection.id, function (err) {
      if (err)
        return callback(err);

      joola.config.set('authentication:organizations:' + context.user.organization + ':collections:' + collection.id, collection, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(err, collection);
      });
    });
  }
};

/**
 * @function delete
 * @param {string} id holds the id of the collection to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific collection by id:
 * - `id` of the collection to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted collection.
 *
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `collections:delete-request`, `collections:delete-done`
 *
 * ```js
 * joola.collections.delete('dummyCollection', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/api/collections/delete",
  description: "I delete an existing collection",
  inputs: ['organization', 'id'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:delete'
  },
  run: function (context, organization, id, callback) {
    callback = callback || emptyfunc;

    exports.get.run(context, organization, id, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('authentication:organizations:' + organization + ':collections:' + id, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        exports.get.run(context, organization, id, function (err, value) {
          if (err)
            return callback(null);

          joola.mongo.collection('cache', organization + '_' + id, function (err, collection) {
            /* istanbul ignore if */
            if (err)
              return callback(err);
            collection.drop(callback);
          });
        });
      });
    });
  }
};

/**
 * @function stats
 * @param {string} id holds the id of the collection to get stats for.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a all known statistics for a collection, including size, number of documents, indexes and more:
 * - `id` of the collection to get stats for
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the collection's statistics.
 *
 * Configuration elements participating: `config:datamap:collections`.
 *
 * Events raised via `dispatch`: `collections:stats-request`, `collections:stats-done`
 *
 * ```js
 * joola.collections.stats('dummyCollection', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.stats = {
  name: "/api/collections/stats",
  description: "I provide stats about a collection",
  inputs: ['organization', 'id'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:stats'
  },
  run: function (context, organization, id, callback) {
    callback = callback || emptyfunc;

    exports.get.run(context, organization, id, function (err, value) {
      if (err)
        return callback(err);

      joola.mongo.collection('cache', context.user.organization + '_' + id, function (err, collection) {
        /* istanbul ignore if */
        if (err)
          return callback(err);
        collection.stats(callback);
      });
    });
  }
};

/**
 * @function maxdate
 * @param {string} id holds the id of the collection to check.
 * @param {string} [key] the name of the cache column to check the max date on.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific collection min date by id and optional key:
 * - `id` of the collection to get min date for
 * - `key` name of the column to check max date on
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the max date of the collection.
 *
 * Configuration elements participating: `config:datamap:collections`.
 *
 * Events raised via `dispatch`: `collections:maxdate-request`, `collections:maxdate-done`
 *
 * ```js
 * joola.collections.maxdate('dummyCollection', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.maxdate = {
  name: "/api/collections/maxdate",
  description: "I provide the maximum date available in the collection",
  inputs: {
    required: ['organization', 'id'],
    optional: ['key']
  },
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:maxdate'
  },
  run: function (context, organization, id, key, callback) {
    if (typeof key === 'function') {
      callback = key;
      key = null;
    }

    exports.get.run(context, organization, id, function (err, value) {
      if (err)
        return callback(err);

      var sortKey = {};
      sortKey[key ? key : 'timestamp'] = -1;
      joola.mongo.find('cache', organization + '_' + id, {}, {limit: 1, sort: sortKey}, function (err, result) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(null, result && result[0] && result[0].timestamp ? new Date(result[0].timestamp) : null);
      });
    });
  }
};

/**
 * @function mindate
 * @param {string} id holds the id of the collection to check.
 * @param {string} [key] the name of the cache column to check the min date on.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific collection min date by id and optional key:
 * - `id` of the collection to get min date for
 * - `key` name of the column to check min date on
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the min date of the collection.
 *
 * Configuration elements participating: `config:datamap:collections`.
 *
 * Events raised via `dispatch`: `collections:mindate-request`, `collections:mindate-done`
 *
 * ```js
 * joola.collections.mindate('dummyCollection', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.mindate = {
  name: "/api/collections/mindate",
  description: "I provide the minimum date available in the collection",
  inputs: {
    required: ['organization', 'id'],
    optional: ['key']
  },
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:mindate'
  },
  run: function (context, organization, id, key, callback) {
    if (typeof key === 'function') {
      callback = key;
      key = null;
    }
    callback = callback || emptyfunc;

    exports.get.run(context, organization, id, function (err, value) {
      if (err)
        return callback(err);

      var sortKey = {};
      sortKey[key ? key : 'timestamp'] = 1;
      joola.mongo.find('cache', organization + '_' + id, {}, {limit: 1, sort: sortKey}, function (err, result) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(null, result && result[0] && result[0].timestamp ? new Date(result[0].timestamp) : null);
      });
    });
  }
};

exports.metadata = {
  name: "/api/collections/metadata",
  description: "I provide metadata information for a document",
  inputs: {
    required: ['organization', 'document'],
    optional: ['collection']
  },
  _outputExample: {},
  _permission: ['access_system'],
  _dispatch: {
    message: 'collections:metadata'
  },
  run: function (context, organization, document, collection, callback) {
    callback = callback || emptyfunc;
    var _shadow = {};

    if (typeof collection === 'function') {
      callback = collection;
      collection = null;
    }

    if (collection) {
      exports.get.run(context, organization, collection, function (err, _collection) {
        if (err)
          return callback(err);

        //clean nulls for proper deepEqual
        var walkNulls = function (obj) {
          Object.keys(obj).forEach(function (key) {
            var elem = obj[key];
            var type = joola.common.typeof(elem);

            if (type === 'object') {
              return walkNulls(elem);
            }

            if (elem === null)
              obj[key] = {};
          });
        };

        _collection = joola.common.extend({}, _collection);
        delete _collection.id;
        delete _collection.name;

        walkNulls(_collection);
        return callback(null, _collection);
      });
    }
    else {
      var walkObject = function (_shadow, obj) {
        Object.keys(obj).forEach(function (key) {
          var elem = obj[key];
          var type = joola.common.typeof(elem);

          var isAdhoc = type === 'object' && elem.key && elem.type;
          if (type === 'object' && !isAdhoc) {
            var _shadowelem = {};
            _shadow[key] = _shadowelem;
            return walkObject(_shadowelem, elem);
          }
          else if (type === 'object' && isAdhoc) {
            _shadow[key] = elem;
          }
          else if (key === 'ip' || /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/.exec(elem))
            type = 'ip';

          if (!_shadow[key])
            _shadow[key] = {};
          if (type === 'number' || _shadow[key].type === 'metric') {
            //metric

            _shadow[key] = joola.common._extend(_shadow[key], {
              key: key,
              name: key,
              type: 'metric',
              datatype: 'number'/*,
               value: elem*/
            });
            delete _shadow[key].value;
          }
          else if (key === 'timestamp') {
            _shadow[key] = joola.common._extend(_shadow[key], {
              key: key,
              name: key,
              type: 'dimension',
              datatype: 'date'/*,
               value: elem*/
            });
          }
          else {
            //dimension
            _shadow[key] = joola.common._extend(_shadow[key], {
              key: key,
              name: key,
              type: 'dimension',
              datatype: type === 'object' ? typeof elem.value : type/*,
               value: elem*/
            });
          }
          delete _shadow[key].value;
        });
      };

      walkObject(_shadow, document);

      return callback(null, _shadow);
    }
  }
};