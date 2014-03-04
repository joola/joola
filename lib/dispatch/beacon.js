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
  joola = require('../joola.io'),

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

  joola.dispatch.collections.metadata(context, context.user.workspace, _document, null, function (err, meta) {
    /* istanbul ignore if */
    if (err)
      return callback(err);

    joola.dispatch.collections.get(context, context.user.workspace, collection, function (err, _collection) {
      if (err) {
        meta.id = collection;
        meta.name = collection;

        joola.dispatch.collections.add(context, context.user.workspace, meta, function (err, _collection) {
          /* istanbul ignore if */
          if (err)
            return callback(err);

          return callback(null);
        });
      }
      else {
        joola.dispatch.collections.metadata(context, context.user.workspace, _document, collection, function (err, _meta) {
          /* istanbul ignore if */
          if (err)
            return callback(err);

          var match = equal(meta, _meta);
          if (!match) {
            meta.id = collection;
            meta.name = collection;


            joola.dispatch.collections.update(context, context.user.workspace, meta, function (err) {
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

etl.furnish = function (context, collection, documents, callback) {
  var bucket = {};

  if (!Array.isArray(documents))
    documents = [documents];

  var _document;

  if (documents.length > 0)
    _document = ce.clone(documents[0]);

  joola.dispatch.collections.metadata(context, context.user.workspace, _document, collection, function (err, meta) {
    /* istanbul ignore if */
    if (err)
      return callback(err);

    var dimensions = [];
    var dateDimensions = [];
    Object.keys(meta).forEach(function (key) {
      var elem = meta[key];

      if (elem.datatype === 'date' && elem.key !== 'ourTimestamp')
        dateDimensions.push(elem);
      if (elem.type === 'dimension')
        dimensions.push(elem);
    });

    documents.forEach(function (document, index) {
      dateDimensions.forEach(function (dateDimension) {
        var _dimension = joola.common.extend({}, dateDimension);
        //if (dateDimension.mapto)
        //dateDimension = joola.config.datamap.dimensions[dateDimension.mapto];

        if (document[_dimension.key] === null) {
          document[_dimension.key] = new Date().getTime();
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
        bucket.date = new Date(_date);
        _date.setDate(1);
        bucket.month = new Date(_date);
        _date.setMonth(0);
        bucket.year = new Date(_date);

        document[dateDimension.key + '_timebucket'] = bucket;
        document[dateDimension.key] = new Date(document[_dimension.key]);//bucket.second;
      });
      document.ourTimestamp = new Date();

      var documentKey = {};
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
  if (!Array.isArray(documents))
    documents = [documents];

  etl.furnish(context, collection, documents, function (err) {
    /* istanbul ignore if */
    if (err)
      return callback(err);

    joola.mongo.insert('cache', context.user.workspace + '_' + collection, documents, options, function (err) {
      return callback(err, documents);
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
    try {
      exports.insert.run(context, _params.collection, _params.document, function (err, result) {
        /* istanbul ignore if*/
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to route action [' + 'fetch' + ']: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

        return router.responseSuccess(result, req, res);
      });
    }
    catch (ex) {
      /* istanbul ignore next */
      return router.responseError(new router.ErrorTemplate(ex), req, res);
    }
  },
  run: function (context, collection, document, callback) {
    callback = callback || emptyfunc;
    try {
      etl.verify(context, collection, document, function (err) {
        if (err)
          return callback(err);

        etl.load(context, collection, document, {}, function (err, documents) {
          if (err)
            return callback(err);

          return callback(null, documents);
        });
      });

    }
    catch (ex) {
      /* istanbul ignore next */
      console.log('exception', ex);
      /* istanbul ignore next */
      console.log(ex.stack);
    }
  }
};



