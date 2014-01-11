/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

var
  _redis = require('redis'),
  path = require('path'),
  _ = require('underscore'),
  fs = require('fs');

var etl = exports;

etl.init = function (options, callback) {
  var self = etl;

  options = options || {};
  self.namespace = options.namespace || 'cache';
  self.host = options.host || 'localhost';
  self.port = options.port || 6379;
  self.db = options.db || 0;
  self.redis = _redis.createClient(options.port, options.host);
  self.connect = options.connect || null;
  self.error = options.error || null;

  self.redis.select(self.db);
  if (options.auth)
    self.redis.auth(options.auth);

  if (self.connect)
    self.redis.on('connect', self.connect);

  if (self.error)
    self.redis.on('error', self.error);

  joola.logger.debug('[etl] Connected to redis @ ' + self.host + ':' + self.port + '#' + self.db);

  etl.hook();
  return etl.validate(function (err, validated) {
    if (err)
      return callback(err);

    if (validated)
      joola.events.emit('etl:ready');

    return callback(null, validated);
  });
};

etl.hook = function () {
  fs.readdirSync(path.join(__dirname, './')).forEach(function (file) {
    if (file != 'index.js') {
      var module = require('./' + file);
      var modulename = file.replace('.js', '');
      etl[modulename] = module;
      joola.logger.trace('Added source etl module [' + modulename + '] from ' + file);
    }
  });
};

etl.validate = function (callback) {
  etl.redis.keys('*', function (err, values) {
    if (err)
      return callback(err);

    return callback(null);
  });
};

etl.status = function (callback) {
  return callback(null);
};

etl.allocate = function (options, callback) {
  var collectionName = options.name;
  var start_ts = new Date(options.startDate).getTime();
  var end_ts = new Date(options.endDate).getTime();
  var range = [];

  joola.logger.debug('[etl] allocating cache store for [' + collectionName + '], from: ' + start_ts + ', to: ' + end_ts);

  return callback(null);
};

etl.verify = function (collection, document) {
  if (typeof collection === 'string')
    collection = joola.config.datamap.collections[collection];

  if (!collection)
    return null;


  Object.keys(document).forEach(function (key) {
    var field = document[key];

    //verify we're not dealing with objects
    if (typeof field === 'object') {
      document.verified = false;
      document.error = document.error || 'Document contains illegal `object` attribute.';
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

  return etl;
};

etl.transform = function (collection, document) {
  if (typeof collection === 'string')
    collection = joola.config.datamap.collections[collection];

  if (!collection)
    return null;

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
  else
    return etl;

  Object.keys(document).forEach(function (key) {
    var field = document[key];

    //translate the incoming params into their respective dimensions and metrics
    var dimension = _.find(collection.dimensions, function (dimension) {

      return dimension.id == key;
    });
    var metric = _.find(collection.metrics, function (metric) {
      return metric.id == key;
    });

    if (!dimension && !metric && ['verified', 'error', 'transformed', 'ourTimestamp'].indexOf(key) == -1) {
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

  return etl;
};

etl.furnish = function (collection, document) {
  var bucket = {};

  _.filter(collection.dimensions,function (dimension) {
    return dimension.type === 'date';
  }).forEach(function (dateDimension) {

      if (dateDimension.mapto)
        dateDimension =joola.config.datamap.dimensions[dateDimension.mapto];

      var _date = new Date(document[dateDimension.id]);
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
      document[dateDimension.id] = bucket.second;
    });
  document.ourTimestamp = new Date();
};

etl.load = function (collection, document, options, callback) {
  if (typeof collection === 'string')
    collection = joola.config.datamap.collections[collection];

  if (!collection)
    return null;

  if (!document.verified)
    return callback(new Error('Failed to verify document: ' + document.error || 'unknown error.'));

  if (document.transformed === false)
    return callback(new Error('Failed to transform document: ' + document.error || 'unknown error.'));

  etl.furnish(collection, document);

  delete document.verified;
  delete document.error;
  delete document.transformed;

  joola.mongo.insert('cache', collection.id, document, options, callback);
};

etl.update = function (callback) {

};

etl.upsert = function (callback) {

};

etl.purge = function (callback) {

};