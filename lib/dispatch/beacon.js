/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/



var
  mongo = require('../common/mongo'),
  router = require('../webserver/routes/index'),

  _redis = require('redis'),
  path = require('path'),
  _ = require('underscore'),
  fs = require('fs');

var etl = {};
exports.etl = etl;

etl.verify = function (collection, documents, callback) {
  var process = function (collection) {
    documents.forEach(function (document, index) {
      if (document && typeof document === 'object') {
        var documentKey = {};
        Object.keys(document).forEach(function (key) {
          var field = document[key];

          //verify we're not dealing with objects
          if (joola.common.toType(field) === 'object') {
            document.verified = false;
            document.error = document.error || 'Document contains illegal `object` attribute [' + key + '].';
          }

          //translate the incoming params into their respective dimensions and metrics
          var dimension = _.find(collection.dimensions, function (dimension) {
            return dimension.id == key;
          });
          var metric = _.find(collection.metrics, function (metric) {
            return metric.id == key;
          });

          if (!dimension && !metric) {
            document.verified = false;
            document.error = document.error || 'Failed to validate metrics or dimensions [' + key + '].';
          }
          if (dimension)
            documentKey[dimension.id] = document[dimension.id];
        });

        if (!document.hasOwnProperty('verified'))
          document.verified = true;

        document._key = joola.common.hash(JSON.stringify(documentKey).toString());
      }
      documents[index] = document;
    });
    return callback(null, collection);
  };

  var _collection;
  if (typeof collection === 'string')
    _collection = joola.config.datamap.collections[collection];

  if (!Array.isArray(documents))
    documents = [documents];

  if (!_collection) {
    if (!joola.config.datamap.mode || joola.config.datamap.mode === 'promiscuous') {
      var collectionDef =
      {
        id: collection,
        name: collection,
        description: collection,
        type: 'ad-hoc',
        dimensions: {},
        metrics: {}
      };

      if (documents.length > 0) {
        var document = documents[0];
        Object.keys(document).forEach(function (key) {
          var value = document[key];
          if (key === 'timestamp' ){//|| joola.common.typeof(value) === 'date') {
            collectionDef.dimensions[key] = {
              id: 'timestamp',
              name: 'Date',
              mapto: 'timestamp'
            };
          }
          else if (key === 'ip' || /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/.exec(value)) {
            collectionDef.dimensions[key] = {
              id: key,
              name: key,
              type: 'ip'
            };
          }
          else if (joola.common.typeof(value) === 'string') {
            collectionDef.dimensions[key] = {
              id: key,
              name: key,
              type: 'string'
            };
          }
          else if (joola.common.typeof(value) === 'number' && key.indexOf('avg') == -1) {
            collectionDef.metrics[key] = {
              id: key,
              name: key,
              type: 'float',
              aggregation: 'sum'
            };
          }
          else if (joola.common.typeof(value) === 'number' && key.indexOf('avg') > -1) {
            collectionDef.metrics[key] = {
              id: key,
              name: key,
              type: 'float',
              aggregation: 'avg'
            };
          }
          else {
            collectionDef.dimensions[key] = {
              id: key,
              name: key,
              type: 'string'
            };
          }
        });
      }

      joola.collections.add(null, collectionDef, function (err, _collection) {
        if (err)
          return callback(err);

        process(_collection);
      });
    }
    else
      return callback(new Error('Failed to locate collection [' + collection + '].'));
  }
  else
    process(_collection);
};

etl.transform = function (collection, documents, callback) {
  if (typeof collection === 'string')
    collection = joola.config.datamap.collections[collection];

  if (!collection)
    return callback(new Error('Failed to locate collection [' + collection + '].'));

  if (!Array.isArray(documents))
    documents = [documents];
  documents.forEach(function (document, index) {
    if (!document.verified)
      etl.verify(collection, document);

    if (collection.transform) {
      try {
        var transformFn = eval('(' + collection.transform + ')');
        transformFn(collection, document);
      }
      catch (ex) {
        document.transformed = false;
        document.error = ex.message;
      }
    }
    if (!document.hasOwnProperty('transformed'))
      document.transformed = true;
    //else
    //return etl;

    Object.keys(document).forEach(function (key) {
      var field = document[key];

      //translate the incoming params into their respective dimensions and metrics
      var dimension = _.find(collection.dimensions, function (dimension) {

        return dimension.id == key;
      });
      var metric = _.find(collection.metrics, function (metric) {
        return metric.id == key;
      });

      if (!dimension && !metric && ['verified', 'error', 'transformed', 'ourTimestamp', '_key'].indexOf(key) == -1) {
        document.verified = false;
        document.error = document.error || 'Found an unknown dimension/metric [' + key + '].';
      }

      /*
       if (dimension) {
       document[key] = dimension;
       document[key].value = field;
       }
       if (metric) {
       document[key] = metric;
       document[key].value = field;
       }*/
    });
    documents[index] = document;
  });
  return callback(null, collection);
};

etl.furnish = function (collection, documents, callback) {
  var bucket = {};

  if (typeof collection === 'string')
    collection = joola.config.datamap.collections[collection];

  if (!Array.isArray(documents))
    documents = [documents];

  documents.forEach(function (document, index) {
    _.filter(collection.dimensions,function (dimension) {
      return dimension.type === 'date' || (dimension.mapto && joola.config.datamap.dimensions[dimension.mapto].type === 'date');
    }).forEach(function (dateDimension) {
        var _dimensnion = joola.common.extend({}, dateDimension);
        if (dateDimension.mapto)
          dateDimension = joola.config.datamap.dimensions[dateDimension.mapto];

        if (document[_dimensnion.id] == null) {
          document[_dimensnion.id] = new Date().getTime();
        }
        var _date = new Date(document[_dimensnion.id]);
        _date.setMilliseconds(0);
        bucket.second = new Date(_date);
        _date.setSeconds(0);
        bucket.minute = new Date(_date);
        _date.setMinutes(0);
        bucket.hour = new Date(_date);
        _date.setUTCHours(0, 0, 0, 0);
        bucket.date = new Date(_date);
        _date.setDate(1);
        bucket.month = new Date(_date);
        _date.setMonth(0);
        bucket.year = new Date(_date);

        document[dateDimension.id + '_timebucket'] = bucket;
        document[dateDimension.id] = new Date(document[_dimensnion.id]);//bucket.second;
      });
    document.ourTimestamp = new Date();
    documents[index] = document;
  });

  return callback(null, collection);
};

etl.load = function (collection, documents, options, callback) {
  if (typeof collection === 'string')
    collection = joola.config.datamap.collections[collection];

  if (!collection)
    return callback(new Error('Failed to locate collection [' + collection + '].'));

  if (!Array.isArray(documents))
    documents = [documents];

  //documents.forEach(function (document) {
    //if (!document.verified)
    //  return callback(new Error('Failed to verify document: ' + document.error || 'unknown error.'));

    //if (document.transformed === false)
    //  return callback(new Error('Failed to transform document: ' + document.error || 'unknown error.'));

    //delete document.verified;
    //delete document.error;
    //delete document.transformed;

    etl.furnish(collection, documents, function (err) {
      if (err)
        return callback(err);

      joola.mongo.insert('cache', collection.id, documents, options, callback);
    });
  //});
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
  name: "/api/beacon/insert",
  description: "",
  inputs: ['collection', 'document'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'beacon:insert'
  },
  run: function (context, collection, document, callback) {
    callback = callback || emptyfunc;

    try {
      etl.verify(collection, document, function (err, collection) {
        if (err)
          return callback(err);

        etl.transform(collection, document, function (err, collection) {
          if (err)
            return callback(err);

          etl.load(collection, document, {}, function (err) {
            if (err)
              return callback(err)

            return callback(null);
          });
        });
      });
    }
    catch (ex) {
      console.log('exception', ex);

    }
  }
};