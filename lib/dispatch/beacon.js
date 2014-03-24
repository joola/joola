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

etl.verify = function (context, workspace, collection, documents, callback) {
  var _document;
  if (!Array.isArray(documents))
    documents = [documents];

  if (documents.length > 0)
    _document = ce.clone(documents[0]);

  if (!_document.hasOwnProperty('timestamp'))
    return callback(new Error('Timestamp must be specified'));

  joola.dispatch.collections.metadata(context, workspace, _document, null, function (err, meta) {
    /* istanbul ignore if */
    if (err)
      return callback(err);

    joola.dispatch.collections.get(context, workspace, collection, function (err, _collection) {
      if (err) {
        meta.id = collection;
        meta.name = collection;

        joola.dispatch.collections.add(context, workspace, meta, function (err, _collection) {
          /* istanbul ignore if */
          if (err)
            return callback(err);

          return callback(null);
        });
      }
      else {
        joola.dispatch.collections.metadata(context, workspace, _document, collection, function (err, _meta) {
          /* istanbul ignore if */
          if (err)
            return callback(err);

          var match = equal(meta, _meta);
          if (!match) {
            meta.id = collection;
            meta.name = collection;


            joola.dispatch.collections.update(context, workspace, meta, function (err) {
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

etl.furnish = function (context, workspace, collection, documents, callback) {
  var bucket = {};

  if (!Array.isArray(documents))
    documents = [documents];

  var _document;

  if (documents.length > 0)
    _document = ce.clone(documents[0]);

  joola.dispatch.collections.metadata(context, workspace, _document, collection, function (err, meta) {
    /* istanbul ignore if */
    if (err)
      return callback(err);

    var dimensions = [];
    var metrics = [];
    var dateDimensions = [];
    Object.keys(meta).forEach(function (key) {
      var elem = meta[key];

      if (elem.datatype === 'date' && elem.key !== 'ourTimestamp')
        dateDimensions.push(elem);
      if (elem.type === 'dimension')
        dimensions.push(elem);
      if (elem.type === 'metric')
        metrics.push(elem);
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
        bucket.ddate = new Date(_date);
        _date.setDate(1);
        bucket.month = new Date(_date);
        _date.setMonth(0);
        bucket.year = new Date(_date);

        document[dateDimension.key + '_timebucket'] = bucket;
        document[dateDimension.key] = new Date(document[_dimension.key]);//bucket.second;
      });
      document.ourTimestamp = new Date();

      metrics.forEach(function (m) {
        document[m.key] = [document[m.key]]
      });

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

    return callback(null, collection, meta);
  });
};

etl.crunch = function (context, workspace, collection, meta, documents, interval, options, callback) {
  var crunched = [];
  documents.forEach(function (doc) {
    switch (interval) {
      case 'second':
        doc.timestamp = doc.timestamp_timebucket.second;
        break;
      case 'minute':
        doc.timestamp = doc.timestamp_timebucket.minute;
        delete doc.timestamp_timebucket.second;
        break;
      case 'hour':
        doc.timestamp = doc.timestamp_timebucket.hour;
        delete doc.timestamp_timebucket.second;
        delete doc.timestamp_timebucket.minute;
        break;
      case 'ddate':
        doc.timestamp = doc.timestamp_timebucket.ddate;
        delete doc.timestamp_timebucket.second;
        delete doc.timestamp_timebucket.minute;
        delete doc.timestamp_timebucket.hour;
        break;
      case 'month':
        doc.timestamp = doc.timestamp_timebucket.month;
        delete doc.timestamp_timebucket.second;
        delete doc.timestamp_timebucket.minute;
        delete doc.timestamp_timebucket.hour;
        delete doc.timestamp_timebucket.ddate;
        break;
      case 'year':
        doc.timestamp = doc.timestamp_timebucket.year;
        delete doc.timestamp_timebucket.second;
        delete doc.timestamp_timebucket.minute;
        delete doc.timestamp_timebucket.hour;
        delete doc.timestamp_timebucket.ddate;
        delete doc.timestamp_timebucket.month;
        break;
      default:
        break;
    }
    //doc.timestamp_timebucket = doc.timestamp_timebucket;
    var documentKey = {};
    Object.keys(meta).forEach(function (key) {
      var attribute = meta[key];
      if (attribute.type !== 'metric')
        documentKey[key] = doc[key];
    });

    var _key = joola.common.hash(JSON.stringify(documentKey).toString());
    var exist = _.find(crunched, function (c) {
      return c._key === _key;
    });


    var row = null;
    if (exist) {
      row = exist;
    }
    else {
      row = ce.clone(doc);
      row._key = _key;
    }

    Object.keys(meta).forEach(function (key) {
      var attribute = meta[key];
      if (attribute.type === 'metric') {
        if (!Array.isArray(row[attribute.key]))
          row[attribute.key] = [];
        row[attribute.key].push(doc[attribute.key]);
      }
      else if (key !== 'timestamp')
        row[attribute.key] = doc[attribute.key];
    });
    if (!exist)
      crunched.push(row);
  });

  var expected = crunched.length;
  crunched.forEach(function (cr) {
    var filter = {
      _key: cr._key};
    var update = {
      $set: {},
      $push: {}
    };
    var options = {
      upsert: true,
      multi: false
    };

    Object.keys(meta).forEach(function (key) {
      var attribute = meta[key];
      if (attribute.type === 'metric') {
        update.$push[attribute.key] = {$each: cr[key]};
      }
      else {
        update.$set[attribute.key] = cr[key];
      }
    });

    update.$set._key = cr._key;
    update.$set.timestamp_timebucket = cr.timestamp_timebucket;

    joola.mongo.update('cache', workspace + '_' + interval + '_' + collection, filter, update, options, function (err) {
      expected--;
      if (expected == 0) {
        return callback(null, documents);
      }
    });
  });
};

etl.load = function (context, workspace, collection, documents, options, callback) {
  if (!Array.isArray(documents))
    documents = [documents];

  etl.furnish(context, workspace, collection, documents, function (err, col, meta) {
    /* istanbul ignore if */
    if (err)
      return callback(err);

    joola.mongo.insert('cache', workspace + '_' + collection, ce.clone(documents), options, function (err) {
      /*
       var savedTimestamp = new Date();
       documents.forEach(function (document) {
       document.savedTimestamp = savedTimestamp;
       });*/

      documents.forEach(function (doc) {
        Object.keys(meta).forEach(function (key) {
          var attribute = meta[key];
          if (attribute.type === 'metric') {
            if (Array.isArray(doc[attribute.key]))
              doc[attribute.key] = doc[attribute.key] [0];
          }
        });
      });
      //let's crunch!
      etl.crunch(context, workspace, collection, meta, ce.clone(documents), 'second', options, function () {
        etl.crunch(context, workspace, collection, meta, ce.clone(documents), 'minute', options, function () {
          etl.crunch(context, workspace, collection, meta, ce.clone(documents), 'hour', options, function () {
            etl.crunch(context, workspace, collection, meta, ce.clone(documents), 'ddate', options, function () {
              etl.crunch(context, workspace, collection, meta, ce.clone(documents), 'month', options, function () {
                etl.crunch(context, workspace, collection, meta, ce.clone(documents), 'year', options, callback);
              });
            });
          });
        });
      });
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
        return router.responseError(new router.ErrorTemplate('Document must be a valid JSON'), req, res);
      }
    }
    var context = {};
    context.user = req.user;
    if (!_params.workspace)
      _params.workspace = req.user.workspace;
    try {
      exports.insert.run(context, _params.workspace, _params.collection, _params.document, function (err, result) {
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
  run: function (context, workspace, collection, document, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    callback = callback || emptyfunc;
    try {
      etl.verify(context, workspace, collection, document, function (err) {
        if (err)
          return callback(err);
        etl.load(context, workspace, collection, document, {}, function (err, documents) {
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



