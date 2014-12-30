/**
 *  @title joola.collections
 *  @description
 *  joola uses the concept of `collections` to organize documents into logical sections.
 *  [[Collections]] include definitions on metrics, dimensions and other attributes. that instruct joola on how to
 *  translate the collection's data into meaningful insight.
 *
 *  Collections are part of the [Dispatch sub-system](the-dispatch-subsystem) and can be access from both the server and client side, via
 *  `joola.collections`.
 *
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/

'use strict';

var
  ce = require('cloneextend'),
  traverse = require('traverse'),
  kindof = require('kindof'),
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

var joola = require('../joola');

exports.list = {
  name: "/collections/list",
  description: "I list all available collections",
  inputs: ['workspace'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['collections:list'],
  _dispatch: {
    message: 'collections:list'
  },
  run: function (context, workspace, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    joola.config.get('workspaces:' + workspace + ':collections', function (err, value) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      var result = joola.common.obj2array(value);
      result.forEach(function (r, i) {
        r.dimensions = [];
        r.metrics = [];
        function lookup(obj, type, lookupValue) {
          var result = [];
          traverse(obj).map(function (x) {

            if (kindof(x) === 'object') {
              if (x.hasOwnProperty(type) && x[type] === lookupValue) {
                x.key = this.path.join('.');
                result.push(x);
              }
            }
          });
          return result;
        }

        r.dimensions = lookup(value, 'type', 'dimension');
        r.metrics = lookup(value, 'type', 'metric');

        result[i] = new Proto(r);

      });
      return callback(null, result);
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
  name: "/collections/get",
  description: "I get a specific collection by id`",
  inputs: ['workspace', 'id'],
  _proto: Proto.proto,
  _outputExample: {},
  _permission: ['collections:get'],
  _dispatch: {
    message: 'collections:get'
  },
  run: function (context, workspace, id, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    joola.config.get('workspaces:' + workspace + ':collections:' + id, function (err, value) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      if (typeof value === 'undefined' || value === null)
        return callback(new Error('collections [' + id + '] does not exist.'));

      value.dimensions = [];
      value.metrics = [];


      function lookup(obj, type, lookupValue) {
        var result = [];
        traverse(obj).map(function (x) {

          if (kindof(x) === 'object') {
            if (x.hasOwnProperty(type) && x[type] === lookupValue) {
              x.key = this.path.join('.');
              result.push(x);
            }
          }
        });
        return result;
      }

      value.dimensions = lookup(value, 'type', 'dimension');
      value.metrics = lookup(value, 'type', 'metric');
      value = new Proto(value);

      value.storeKey = workspace + '_' + id;

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
  name: "/collections/add",
  description: "I add a new collection",
  inputs: ['workspace', 'collection'],
  _outputExample: {},
  _permission: ['collections:add'],
  _dispatch: {
    message: 'collections:add'
  },
  run: function (context, workspace, collection, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    try {
      collection = new Proto(collection);
    } catch (ex) {
      return callback(ex);
    }

    exports.get.run(context, workspace, collection.key, function (err, _collection) {
      if (_collection) {
        return callback(new Error('Collection [' + collection.key + '] already exist'));
      }

      joola.config.set('workspaces:' + workspace + ':collections:' + collection.key, collection, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        collection.dimensions = [];
        collection.metrics = [];
        Object.keys(collection).forEach(function (key) {
          var elem = collection[key];
          if (elem.type === 'dimension') {
            collection.dimensions.push(elem);
          }
          else if (elem.type === 'metric') {
            collection.metrics.push(elem);
          }
        });

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
exports.patch = {
  name: "/collections/patch",
  description: "I patch an existing collection",
  inputs: ['workspace', 'collection', 'payload'],
  _outputExample: {},
  _permission: ['collections:patch'],
  _dispatch: {
    message: 'collections:patch'
  },
  run: function (context, workspace, collection, payload, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, collection, function (err, value) {
      if (err)
        return callback(err);


      var _collection = null;
      try {
        _collection = joola.common.extend(value, payload);
        _collection = new Proto(_collection);
      } catch (ex) {
        return callback(ex);
      }

      joola.config.set('workspaces:' + workspace + ':collections:' + collection, _collection, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        return callback(err, _collection);
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
 * Configuration elements participating: `config:workspaces`.
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
  name: "/collections/delete",
  description: "I delete an existing collection",
  inputs: ['workspace', 'id'],
  _outputExample: {},
  _permission: ['collections:delete'],
  _dispatch: {
    message: 'collections:delete'
  },
  run: function (context, workspace, id, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, id, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('workspaces:' + workspace + ':collections:' + id, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        joola.datastore.providers.default.drop(workspace + '_' + id, callback);
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
  name: "/collections/stats",
  description: "I provide stats about a collection",
  inputs: ['workspace', 'id'],
  _outputExample: {},
  _permission: ['collections:stats'],
  _dispatch: {
    message: 'collections:stats'
  },
  run: function (context, workspace, id, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, id, function (err, value) {
      if (err)
        return callback(err);

      joola.datastore.providers.default.stats(workspace + '_' + id, callback);
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

 exports.maxdate = {
  name: "/collections/maxdate",
  description: "I provide the maximum date available in the collection",
  inputs: {
    required: ['workspace', 'id'],
    optional: ['key']
  },
  _outputExample: {},
  _permission: ['collections:maxdate'],
  _dispatch: {
    message: 'collections:maxdate'
  },
  run: function (context, workspace, id, key, callback) {
    if (typeof key === 'function') {
      callback = key;
      key = null;
    }

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, id, function (err, value) {
      if (err)
        return callback(err);

      var sortKey = {};
      sortKey[key ? key : 'timestamp'] = -1;
      joola.mongo.find('cache', workspace + '_' + id, {}, {limit: 1, sort: sortKey}, function (err, result) {
        if (err)
          return callback(err);

        return callback(null, result && result[0] && result[0].timestamp ? new Date(result[0].timestamp) : null);
      });
    });
  }
};
 */
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

 exports.mindate = {
  name: "/collections/mindate",
  description: "I provide the minimum date available in the collection",
  inputs: {
    required: ['workspace', 'id'],
    optional: ['key']
  },
  _outputExample: {},
  _permission: ['collections:mindate'],
  _dispatch: {
    message: 'collections:mindate'
  },
  run: function (context, workspace, id, key, callback) {
    if (typeof key === 'function') {
      callback = key;
      key = null;
    }
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    exports.get.run(context, workspace, id, function (err, value) {
      if (err)
        return callback(err);

      var sortKey = {};
      sortKey[key ? key : 'timestamp'] = 1;
      joola.mongo.find('cache', workspace + '_' + id, {}, {limit: 1, sort: sortKey}, function (err, result) {
        if (err)
          return callback(err);

        return callback(null, result && result[0] && result[0].timestamp ? new Date(result[0].timestamp) : null);
      });
    });
  }
};
 */
exports.metadata = {
  name: "/collections/metadata",
  description: "I provide metadata information for a document",
  inputs: {
    required: ['workspace', 'document'],
    optional: ['collection']
  },
  _outputExample: {},
  _permission: ['collections:metadata'],
  _dispatch: {
    message: 'collections:metadata'
  },
  run: function (context, workspace, collection, document, callback) {
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    var _shadow = {};

    if (typeof collection === 'function') {
      callback = collection;
      collection = null;
    }

    if (collection) {
      exports.get.run(context, workspace, collection, function (err, _collection) {
        if (err)
          return callback(err);

        //clean nulls for proper deepEqual
        var walkNulls = function (obj) {
          Object.keys(obj).forEach(function (key) {
            var elem = obj[key];

            if (elem && elem.hasOwnProperty('min'))
              delete elem.min;
            if (elem && elem.hasOwnProperty('max'))
              delete elem.max;
            var type = joola.common.typeof(elem);

            if (type === 'object') {
              return walkNulls(elem);
            }

            if (elem === null)
              obj[key] = {};
          });
        };
        var result = ce.clone(_collection);
        delete result.key;
        delete result.name;
        delete result.strongTyped;
        delete result.expireafterseconds;
        walkNulls(result);
        return callback(null, ce.clone(result), ce.clone(_collection));
      });
    }
    else {
      var walkObject = function (_shadow, obj) {
        try {
          Object.keys(obj).forEach(function (key) {

            var elem = obj[key];
            var type = joola.common.typeof(elem);

            var isAdhoc = type === 'object' && elem.key && elem.type;
            var _shadowelem;


            if (elem === null) {

            }
            else if (type === 'object' && !isAdhoc) {
              _shadowelem = {};
              _shadow[key] = _shadowelem;
              return walkObject(_shadowelem, elem);
            }
            else if (type === 'object' && isAdhoc) {
              _shadow[key] = elem;
            }
            else if (type === 'array') {
              _shadowelem = [];
              _shadow[key] = _shadowelem;
              return walkObject(_shadowelem, elem);
            }
            else if (key === 'ip' || /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/.exec(elem))
              type = 'ip';

            if (elem !== null && !_shadow[key])
              _shadow[key] = {};
            if (elem !== null && (type === 'number' || _shadow[key].type === 'metric')) {
              //metric

              _shadow[key] = joola.common._extend(_shadow[key], {
                key: key,
                //name: key,
                type: 'metric',
                datatype: 'number'/*,
                 value: elem*/
              });
              delete _shadow[key].value;
            }
            else if (elem !== null && key === 'timestamp') {
              _shadow[key] = joola.common._extend(_shadow[key], {
                key: key,
                //name: key,
                type: 'dimension',
                datatype: 'date'/*,
                 value: elem*/
              });
            }
            else if (elem !== null) {
              //dimension
              _shadow[key] = joola.common._extend(_shadow[key], {
                key: key,
                //name: key,
                type: 'dimension',
                datatype: type === 'object' ? typeof elem.value : type/*,
                 value: elem*/
              });
            }
            if (_shadow[key] && _shadow[key].hasOwnProperty('value'))
              delete _shadow[key].value;
          });
        }
        catch (ex) {
          console.log('Exception walking object', obj);
          throw ex;
        }
      };

      walkObject(_shadow, document);
      return callback(null, ce.clone(_shadow));
    }
  }
};