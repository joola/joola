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
  Object.keys(document).forEach(function (key) {
    var field = document[key];
    console.log(field, typeof field);
    if (typeof field === 'object')
      document.verified = false;
  });

  if (!document.hasOwnProperty('verified'))
    document.verified = true;
  return etl;
};

etl.transform = function (collection, document) {
  if (!document.verified)
    etl.verify(collection, document);

  collection = joola.config.collections[collection];
  var transformFn = eval('(' + collection.transform + ')');
  transformFn(collection, document);


  document.transformed = true;
  return etl;
};

etl.load = function (collection, document, options, callback) {
  if (!document.verified)
    return callback(new Error('Failed to verify document'));
  //delete document.verified;
  //delete document.transformed;
  console.log(document);
  joola.mongo.insert('cache', collection, document, options, callback);
};

etl.update = function (callback) {

};

etl.upsert = function (callback) {

};

etl.purge = function (callback) {

};