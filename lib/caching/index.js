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

var caching = exports;

caching.init = function (options, callback) {
  var self = caching;

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

  joola.logger.debug('[caching] Connected to redis @ ' + self.host + ':' + self.port + '#' + self.db);

  caching.hook();
  return caching.validate(function (err, validated) {
    if (err)
      return callback(err);

    if (validated)
      joola.events.emit('caching:ready');

    return callback(null, validated);
  });
};

caching.hook = function () {
  fs.readdirSync(path.join(__dirname, './')).forEach(function (file) {
    if (file != 'index.js') {
      var module = require('./' + file);
      var modulename = file.replace('.js', '');
      caching[modulename] = module;
      joola.logger.trace('Added source caching module [' + modulename + '] from ' + file);
    }
  });
};

caching.validate = function (callback) {
  caching.redis.keys('*', function (err, values) {
    if (err)
      return callback(err);

    return callback(null);
  });
};

caching.status = function (callback) {
  return callback(null);
};

caching.verify = function (callback) {

};

caching.allocate = function (options, callback) {
  var collectionName = options.name;
  var start_ts = new Date(options.startDate).getTime();
  var end_ts = new Date(options.endDate).getTime();
  var range = [];

  joola.logger.debug('[caching] allocating cache store for [' + collectionName + '], from: ' + start_ts + ', to: ' + end_ts);

  return callback(null);
};

caching.insert = function (collection, document, options, callback) {
  joola.mongo.insert('cache', collection, document, options, callback);
};

caching.update = function (callback) {

};

caching.upsert = function (callback) {

};

caching.purge = function (callback) {

};