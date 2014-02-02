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
  equal = require('deep-equal'),
  ce = require('cloneextend'),
  path = require('path'),
  _ = require('underscore'),
  fs = require('fs');

var etl = {};
exports.etl = etl;

etl.verify = function (context, collection, documents, callback) {
  var _document;
  if (!Array.isArray(documents))
    documents = [documents];

  if (documents.length > 0)
    _document = ce.clone(documents[0]);

  joola.dispatch.collections.metadata(context, _document, null, function (err, meta) {
    if (err)
      return callback(err);


    joola.dispatch.collections.get(context, collection, function (err, _collection) {
      if (err) {
        meta.id = collection;
        meta.name = collection;

        joola.dispatch.collections.add(context, meta, function (err, _collection) {
          if (err)
            return callback(err);

          return callback(null);
        });
      }
      else {
        joola.dispatch.collections.metadata(context, _document, collection, function (err, _meta) {
          if (err)
            return callback(err);
          var match = equal(meta, _meta);
          if (!match) {
            meta.id = collection;
            meta.name = collection;

            joola.dispatch.collections.update(context, meta, function (err) {
              joola.logger.debug('Updating collection [' + collection + '] due to meta change.');
              return callback(null);
            });
          }
          else {
            return callback(null);
          }
        });
      }
    });
  });
};
/*
 etl.verify = function (collection, documents, callback) {






 var process = function (collection) {
 documents.forEach(function (document, index) {

 if (document && typeof document === 'object') {
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
 });

 if (!document.hasOwnProperty('verified'))
 document.verified = true;


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
 id: collection.id ? collection.id : collection,
 name: collection.id ? collection.id : collection,
 description: collection.id ? collection.id : collection,
 type: 'ad-hoc',
 dimensions: {},
 metrics: {}
 };

 if (documents.length > 0) {
 var document = documents[0];
 //if (typeof document === 'string')
 //document = JSON.parse(document);

 Object.keys(document).forEach(function (key) {
 var value = document[key];
 if (key === 'timestamp') {//|| joola.common.typeof(value) === 'date') {
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

 return joola.collections.get(null, collection.id ? collection.id : collection, function (err, _collection) {
 if (err)
 console.log('eerrr', err);
 if (_collection)
 return process(_collection);
 else
 return joola.collections.add(null, collectionDef, function (err, _collection) {
 if (!_collection) {
 return callback(new Error('Failed to get/add ad-hoc collection: ' + err));
 }

 return process(_collection);
 });
 });
 }
 else
 return callback(new Error('Failed to locate collection [' + collection + '].'));
 }
 else
 return process(_collection);
 };

 etl.transform = function (collection, documents, callback) {
 if (typeof collection === 'string')
 collection = joola.config.datamap.collections[collection];

 if (!collection)
 return callback(new Error('Failed to locate collection [' + collection + '].'));

 if (!Array.isArray(documents))
 documents = [documents];
 documents.forEach(function (document, index) {
 //if (!document.verified)
 //etl.verify(collection, document);
 if (typeof document === 'string') {
 document = JSON.parse(document);
 documents[index] = document;
 }

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

 });
 documents[index] = document;
 });
 return callback(null, collection);
 };
 */

etl.furnish = function (context, collection, documents, callback) {
  var bucket = {};

  var walkObject = function (obj) {
    if (!obj)
      return;
    Object.keys(obj).forEach(function (key) {
      var elem = obj[key];
      if (key !== '_id') {
        var type = joola.common.typeof(elem);
        if (type === 'object') {
          if (elem != null) {
            Object.keys(elem).forEach(function (attribute) {
              if (typeof elem[attribute] !== 'object')
                if (attribute !== 'value') {
                  delete elem[attribute];
                }
                else {
                  obj[key] = elem[attribute];
                }
              else {
                return walkObject(elem[attribute]);
              }
            });
          }
          else {
            obj[key] = null;
          }
        }
      }
    });
  };

  if (!Array.isArray(documents))
    documents = [documents];

  var _document;

  if (documents.length > 0)
    _document = ce.clone(documents[0]);

  joola.dispatch.collections.metadata(context, _document, collection, function (err, meta) {
    var dimensions = [];
    var dateDimensions = [];
    Object.keys(_document).forEach(function (key) {
      var elem = _document[key];
      if (elem.datatype === 'date' && elem.key !== 'ourTimestamp')
        dateDimensions.push(elem);
      if (elem.type === 'dimension')
        dimensions.push(elem);
    });

    documents.forEach(function (document, index) {

      walkObject(document);

      dateDimensions.forEach(function (dateDimension) {
        var _dimension = joola.common.extend({}, dateDimension);
        //if (dateDimension.mapto)
        //dateDimension = joola.config.datamap.dimensions[dateDimension.mapto];

        if (document[_dimension.key] == null) {
          document[_dimension.key] = new Date().getTime();
        }
        var _date = new Date(document[_dimension.key]);
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

        document[dateDimension.key + '_timebucket'] = bucket;
        document[dateDimension.key] = new Date(document[_dimension.key]);//bucket.second;
      });
      document.ourTimestamp = new Date();

      var documentKey = {}
      dimensions.forEach(function (key) {
        //var d = collection.dimensions[key];
        documentKey[key] = document[key];
      });
      if (collection.unique)
        document._key = joola.common.hash(JSON.stringify(documentKey).toString());
      else
        document._key = joola.common.uuid();
      documents[index] = document;
    });


    return callback(null, collection);
  });
};

etl.load = function (context, collection, documents, options, callback) {
  /*
   if (typeof collection === 'string')
   collection = joola.config.datamap.collections[collection];

   if (!collection)
   return callback(new Error('Failed to locate collection [' + collection + '].'));
   */
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

  etl.furnish(context, collection, documents, function (err) {
    if (err)
      return callback(err);

    joola.mongo.insert('cache', context.user.organization + '_' + collection, documents, options, function (err) {
      return callback(err);
    });
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
  _permission: ['beacon_insert'],
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
        return router.responseError(new router.ErrorTemplate('Document must be a valid JSON'), req, res);
      }
    }
    var context = {};
    context.user = req.user;
    exports.insert.run(context, _params.collection, _params.document, function (err, result) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to route action [' + 'fetch' + ']: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

      return router.responseSuccess(result, req, res);
    });
  },
  run: function (context, collection, document, callback) {
    callback = callback || emptyfunc;
    try {
      etl.verify(context, collection, document, function (err) {
        if (err)
          return callback(err);

        //  etl.transform(collection, document, function (err, collection) {
        //    if (err)
        //     return callback(err);

        etl.load(context, collection, document, {}, function (err) {
          if (err)
            return callback(err)

          return callback(null);
        });
      });

    }
    catch (ex) {
      console.log('exception', ex);
      console.log(ex.stack);

    }
  }
};