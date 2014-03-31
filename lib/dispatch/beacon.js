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
          if (err)
            return setImmediate(function () {
              return callback(err);
            });

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

          var match = equal(meta, _meta);
          if (!match && _collection.strongTyped) {
            var differences = diff(meta, _meta);
            joola.logger.warn({category: 'security', diff: differences}, 'Strong-typed collection [' + collection + '] cannot be modified by Beacon.');
            return callback(new Error('Strong-typed collection [' + collection + '] cannot be modified by Beacon.'));
          }
          else if (!match) {
            meta.key = collection;
            meta.name = collection;

            joola.dispatch.collections.update(context, workspace, meta, function (err) {
              joola.logger.debug('Updating collection [' + collection + '] due to meta change.');
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

  if (!Array.isArray(documents))
    documents = [documents];

  joola.dispatch.collections.metadata(context, workspace, ce.clone(documents[0]), collection, function (err, meta, _collection) {
    /* istanbul ignore if */
    if (err)
      return setImmediate(function () {
        return callback(err);
      });

    var dimensions = [];
    var metrics = [];
    var dateDimensions = [];

    //_documents.forEach(function (doc) {
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

    //});

    /*
     Object.keys(meta).forEach(function (key) {
     var elem = meta[key];

     if (elem.datatype === 'date' && elem.key !== 'ourTimestamp')
     dateDimensions.push(elem);
     if (elem.type === 'dimension')
     dimensions.push(elem);
     if (elem.type === 'metric')
     metrics.push(elem);
     });*/

    documents.forEach(function (document, index) {
      var patched = false;
      dateDimensions.forEach(function (dateDimension) {
        var _dimension = joola.common.extend({}, dateDimension);
        if (!document[_dimension.key]) {
          document[_dimension.key] = new Date().getTime();
          patched = true;
        }

        metrics.forEach(function (m) {
          traverse(document).forEach(function (attr) {
            var self = this;
            if (self.path.join('.') === m.path) {
              if (m.min && attr < m.min) {
                document.saved = false;
                document.error = 'Min/max values for [' + m.key + '] are out of range [' + m.min + '-' + m.max + ']';
                joola.logger.warn('Removing document due to out of bound criteria, [' + attr + '][' + m.key + '][' + m.min + '-' + m.max + ']');
              }
              if (m.max && attr > m.max) {
                document.saved = false;
                document.error = 'Min/max values for [' + m.key + '] are out of range [' + m.min + '-' + m.max + ']';
                joola.logger.warn('Removing document due to out of bound criteria, [' + attr + '][' + m.key + '][' + m.min + '-' + m.max + ']');
              }
              self.update([attr]);
            }
          });
        });

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
    traverse(meta).map(function (attribute) {
      //var attribute = meta[key];
      if (attribute.type === 'dimension' && ['_key', 'ourTimestamp', 'timestamp_timebucket'].indexOf(attribute.key) === -1) {
        var value = traverse(doc).get(attribute.path.split('.'));
        if (value) {
          traverse(documentKey).set(attribute.path.split('.'), value);
        }
        //documentKey[attribute.key] = doc[attribute.key];
      }
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
      row.ourTimestamp = new Date();
    }
    var value;
    traverse(meta).forEach(function (attribute) {
      if (attribute.type === 'metric') {
        //console.log('found met', attribute);

        value = traverse(doc).get(attribute.path.split('.'));
        var elem = traverse(row).get(attribute.path.split('.'));
        //traverse(row).set(attribute.path.split('.'), [value]);

        if (!Array.isArray(elem))
          elem = [];
        elem.push(value);

        traverse(row).set(attribute.path.split('.'), elem);
        //row[attribute.key].push(doc[attribute.key]);
      }
      else if (attribute.key !== 'timestamp' && attribute.key) {
        //console.log('found dim', attribute);
        value = traverse(doc).get(attribute.path.split('.'));
        traverse(row).set(attribute.path.split('.'), value);
        //row[attribute.key] = doc[attribute.key];
      }
    });
    if (!exist)
      crunched.push(row);
  });

  var expected = crunched.length;
  crunched.forEach(function (cr) {
    var filter = {
      _key: cr._key
    };
    var update = {
      $set: {},
      $push: {}
    };
    var options = {
      upsert: true,
      multi: false
    };

    traverse(meta).forEach(function (attribute) {
      if (attribute.type === 'metric') {
        value = traverse(cr).get(attribute.path.split('.'));
        if (value && value[0]) {
          //console.log('value', value, attribute.path.split('.'));
          //traverse(update.$push).set(attribute.path.split('.'), {$each: value});
          update.$push[attribute.path] = {$each: value};
        }
        //
      }
      else if (attribute.key) {
        value = traverse(cr).get(attribute.path.split('.'));
        traverse(update.$set).set(attribute.path.split('.'), value);
        //update.$set[attribute.key] = cr[key];
      }
    });
    update.$set._key = cr._key;
    update.$set.timestamp_timebucket = cr.timestamp_timebucket;
    update.$set.ourTimestamp = cr.timestamp;
    //if (collection && collection.expireAfterSeconds)
    //  options.expireAfterSeconds = collection.expireAfterSeconds;

    if (cr.saved) {
      joola.mongo.update('cache-' + interval, workspace + '_' + collection.key, filter, update, options, function (err) {
        expected--;
        if (expected === 0) {
          return setImmediate(function () {
            return callback(null, documents);
          });
        }
      });
    }
    else {
      expected--;
      if (expected === 0) {
        return setImmediate(function () {
          return callback(null, documents);
        });
      }
    }
  });
};

etl.load = function (context, workspace, collection, documents, options, callback) {
  if (!Array.isArray(documents))
    documents = [documents];

  etl.furnish(context, workspace, collection, documents, function (err, _collection, meta) {
    /* istanbul ignore if */
    if (err)
      return setImmediate(function () {
        return callback(err);
      });

    if (_collection && _collection.expireAfterSeconds)
      options.expireAfterSeconds = _collection.expireAfterSeconds;

    var documentsToProcess = ce.clone(documents);
    for (var i = 0; i < documentsToProcess.length; i++) {
      if (documentsToProcess[i] && documentsToProcess[i].hasOwnProperty('saved') && !documentsToProcess[i].saved)
        documentsToProcess.splice(i--, 1);
    }

    if (documentsToProcess.length === 0)
      return callback(null, ce.clone(documents));

    joola.mongo.insert('cache', workspace + '_' + collection, ce.clone(documentsToProcess), options, function (err, _documents) {
      if (err)
        return setImmediate(function () {
          return callback(err);
        });

      _documents.forEach(function (doc, index) {
        traverse(meta).map(function (elem) {
          if (elem.type === 'metric') {
            var value = traverse(doc).get(elem.path.split('.'));
            if (value) {
              traverse(doc).set(elem.path.split('.'), value[0]);
            }
          }
        });
        _documents[index] = doc;
      });

      //let's crunch!
      etl.crunch(context, workspace, _collection, meta, ce.clone(_documents), 'second', options, function (err) {
        if (err)
          console.log('crunch failed: second', err);
        etl.crunch(context, workspace, _collection, meta, ce.clone(_documents), 'minute', options, function (err) {
          if (err)
            console.log('crunch failed: minute', err);
          etl.crunch(context, workspace, _collection, meta, ce.clone(_documents), 'hour', options, function (err) {
            if (err)
              console.log('crunch failed: hour', err);
            etl.crunch(context, workspace, _collection, meta, ce.clone(_documents), 'ddate', options, function (err) {
              if (err)
                console.log('crunch failed: ddate', err);
              etl.crunch(context, workspace, _collection, meta, ce.clone(_documents), 'month', options, function (err) {
                if (err)
                  console.log('crunch failed: month', err);
                etl.crunch(context, workspace, _collection, meta, ce.clone(_documents), 'year', options, function (err) {
                  if (err)
                    console.log('crunch failed: year', err);

                  callback(null, ce.clone(_documents));
                });
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
          return router.responseError(new router.ErrorTemplate('Failed to route action [' + 'insert' + ']: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

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
      if (!Array.isArray(document)) {
        document = [document];
      }
      var documents = [];
      async.mapSeries(document, function (d) {
        etl.verify(context, workspace, collection, document, function (err) {
          if (err)
            return setImmediate(function () {
              return callback(err);
            });
          etl.load(context, workspace, collection, document, {}, function (err, document) {
            if (err)
              return setImmediate(function () {
                return callback(err);
              });

            return setImmediate(function () {
              documents.push(document);
              return callback(null, document);
            });
          });
        });
      }, function (err) {
        return setImmediate(function () {
          return callback(err, documents);
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