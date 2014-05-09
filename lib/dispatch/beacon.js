/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  joola = require('../joola.io'),

  diff = require('deep-diff').diff,
  async = require('async'),
  traverse = require('traverse'),
  mongo = require('../common/mongo'),
  router = require('../webserver/routes/index'),
  equal = require('deep-equal'),
  ce = require('cloneextend'),
  path = require('path'),
  _ = require('underscore'),
  fs = require('fs');

var etl = {};
exports.etl = etl;

etl.verify = function (context, workspace, collection, documents, callback) {
  var _document;
  if (!Array.isArray(documents))
    documents = [documents];

  if (documents.length > 0)
    _document = ce.clone(documents[0]);

  if (!_document.timestamp)
    _document.timestamp = new Date();

  joola.dispatch.collections.metadata(context, workspace, _document, null, function (err, meta) {
    /* istanbul ignore if */
    if (err)
      return setImmediate(function () {
        return callback(err);
      });

    joola.dispatch.collections.get(context, workspace, collection, function (err, _collection) {
      if (err) {
        meta.key = collection;
        meta.name = collection;

        joola.dispatch.collections.add(context, workspace, meta, function (err, _collection) {
          /* istanbul ignore if */
          if (err && err.message != 'Collection already exist') {
            return setImmediate(function () {
              return callback(err);
            });
          }
          return setImmediate(function () {
            return callback(null);
          });
        });
      }
      else {
        joola.dispatch.collections.metadata(context, workspace, _document, collection, function (err, _meta) {
          /* istanbul ignore if */
          if (err)
            return setImmediate(function () {
              return callback(err);
            });
          var differences;
          var match = equal(meta, _meta);

          if (!match) {
            differences = diff(meta, _meta);
            differences = _.filter(differences, function (diff) {
              return diff.kind !== 'N';
            });
          }
          if (differences) {
            match = differences.length === 0;
          }

          if (!match && _collection.strongTyped) {
            joola.logger.warn({category: 'beacon', diff: differences}, 'Strong-typed collection [' + collection + '] cannot be modified by Beacon.');
            return callback(new Error('Strong-typed collection [' + collection + '] cannot be modified by Beacon.'));
          }
          else if (!match) {
            differences = diff(meta, _meta);
            meta.key = collection;
            meta.name = collection;
            joola.dispatch.collections.update(context, workspace, meta, function (err) {
              joola.logger.debug({category: 'beacon', diff: differences}, 'Updating collection [' + collection + '] due to meta change.');
              return setImmediate(function () {
                return callback(null);
              });
            });
          }
          else {
            return setImmediate(function () {
              return callback(null);
            });
          }
        });
      }
    });
  });
};

etl.furnish = function (context, workspace, collection, documents, callback) {
  var bucket = {};

  joola.dispatch.collections.metadata(context, workspace, ce.clone(documents[0]), collection, function (err, meta, _collection) {
    /* istanbul ignore if */
    if (err)
      return setImmediate(function () {
        return callback(err);
      });

    var dimensions = [];
    var metrics = [];
    var dateDimensions = [];

    traverse(meta).forEach(function (attribute) {
      if (attribute.datatype === 'date' && attribute.key !== 'ourTimestamp')
        dateDimensions.push(attribute);
      if (attribute.type === 'dimension') {
        attribute.path = this.path.join('.');
        this.update(attribute);
        dimensions.push(attribute);
      }
      else if (attribute.type === 'metric') {
        attribute.path = this.path.join('.');
        if (_collection[attribute.key] && _collection[attribute.key].hasOwnProperty('min'))
          attribute.min = _collection[attribute.key].min;
        if (_collection[attribute.key] && _collection[attribute.key].hasOwnProperty('max'))
          attribute.max = _collection[attribute.key].max;
        this.update(attribute);
        metrics.push(attribute);
      }
    });

    documents.forEach(function (document, index) {
      var patched = false;
      dateDimensions.forEach(function (dateDimension) {
        var _dimension = joola.common.extend({}, dateDimension);
        if (!document[_dimension.key]) {
          document[_dimension.key] = new Date().getTime();
          patched = true;
        }

        var _date = new Date(document[_dimension.key]);
        bucket.dow = new Date(_date).getDay();
        bucket.hod = new Date(_date).getHours();
        _date.setMilliseconds(0);
        bucket.second = new Date(_date);
        _date.setSeconds(0);
        bucket.minute = new Date(_date);
        _date.setMinutes(0);
        bucket.hour = new Date(_date);
        _date.setUTCHours(0, 0, 0, 0);
        bucket.ddate = new Date(_date);
        _date.setDate(1);
        bucket.month = new Date(_date);
        _date.setMonth(0);
        bucket.year = new Date(_date);

        document[dateDimension.key + '_timebucket'] = bucket;
        document[dateDimension.key] = new Date(document[_dimension.key]);//bucket.second;
      });


      document.ourTimestamp = new Date();
      var documentKey = {};
      dimensions.forEach(function (dimension) {
        //var d = collection.dimensions[key];
        if (['timestamp', '_key', 'ourTimestamp'].indexOf(dimension.key) === -1)
          documentKey[dimension.key] = document[dimension.key];
        else if (dimension.key === 'timestamp')
          documentKey[dimension.key] = document[dimension.key].toISOString();
      });

      //this will ensure that if we assign the timestamp, there's no collision
      if (patched && documents.length > 1) {
        documentKey.index = index;
      }

      if (collection.unique || true)
        document._key = joola.common.hash(JSON.stringify(documentKey).toString());
      else
        document._key = joola.common.uuid();

      documents[index] = document;
    });

    return setImmediate(function () {
      return callback(null, _collection, meta);
    });
  });
};

etl.load = function (context, workspace, collection, documents, options, callback) {
  etl.furnish(context, workspace, collection, documents, function (err, _collection, meta) {
    /* istanbul ignore if */
    if (err)
      return setImmediate(function () {
        return callback(err);
      });

    if (_collection && _collection.expireAfterSeconds)
      options.expireAfterSeconds = _collection.expireAfterSeconds;

    joola.mongo.insert('cache', workspace + '_' + collection, ce.clone(documents), options, function (err, _documents) {
      if (err) {
        return setImmediate(function () {
          return callback(err);
        });
      }
      return callback(null, ce.clone(_documents));
    });
  });
};

etl.update = function (options, callback) {
  return callback(null);
};

etl.upsert = function (options, callback) {
  return callback(null);
};

etl.purge = function (options, callback) {
  return callback(null);
};

etl.find = function (options, callback) {
  return callback(null);
};

exports.insert = {
  name: "/beacon/insert",
  description: "",
  inputs: {
    required: ['workspace', 'collection', 'document'],
    optional: ['options']
  },
  _outputExample: {},
  _permission: ['beacon_insert', 'manage_system'],
  _dispatch: {
    message: 'beacon:insert'
  },
  _route: function (req, res) {
    var _params = {};
    Object.keys(req.params).forEach(function (p) {
      if (p != 'resource' && p != 'action')
        _params[p] = req.params[p];
    });

    if (typeof _params.document === 'string') {
      try {
        _params.document = JSON.parse(_params.document);
      }
      catch (ex) {
        return router.responseError(400, new router.ErrorTemplate('Document must be a valid JSON'), req, res);
      }
    }
    if (_params.document.length > 0 && typeof _params.document[0] === 'string') {
      try {
        _params.document.forEach(function (d, i, arr) {
          arr[i] = JSON.parse(d);
        });
      }
      catch (ex) {
        return router.responseError(400, new router.ErrorTemplate('Document must be a valid JSON'), req, res);
      }
    }
    var context = {};
    context.user = req.user;
    if (!_params.workspace)
      _params.workspace = req.user.workspace;
    try {
      var _token = req.token;

      joola.dispatch.request(_token._ || _token, 'beacon:insert', _params, function (err, result, headers) {
        if (err)
          return router.responseError(500, new router.ErrorTemplate('Failed to route action [' + 'insert' + ']: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

        return router.responseSuccess(result, headers, req, res);
      });
    }
    catch (ex) {
      return router.responseError(500, new router.ErrorTemplate(ex), req, res);
    }
  },
  run: function (context, workspace, collection, documents, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    callback = callback || function () {
    };

    try {
      if (!Array.isArray(documents)) {
        documents = [documents];
      }

      var start_ts = new Date().getTime();
      var count = documents.length;

      etl.verify(context, workspace, collection, documents, function (err) {
        if (err)
          return setImmediate(function () {
            return callback(err);
          });
        etl.load(context, workspace, collection, documents, {}, function (err, documents) {
          if (err)
            return setImmediate(function () {
              return callback(err);
            });

          return setImmediate(function () {
            var end_ts = new Date().getTime();
            if (count > 1)
              joola.logger.trace('Beacon insert, count: ' + count + ', total: ' + (end_ts - start_ts) + 'ms, rate: ' + (count / (end_ts - start_ts)) + 'doc/ms');
            return callback(null, documents);
          });
        });
      });
    }
    catch (ex) {
      /* istanbul ignore next */
      console.log('exception', ex);
      /* istanbul ignore next */
      console.log(ex.stack);

      return setImmediate(function () {
        return callback(ex);
      });
    }
  }
};