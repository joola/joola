/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  fs = require('fs'),
  path = require('path');

module.exports = EmbeddedDiscoveryProvider;

function EmbeddedDiscoveryProvider(options, helpers, callback) {
  if (!(this instanceof EmbeddedDiscoveryProvider)) return new EmbeddedDiscoveryProvider(options, helpers, callback);
  callback = callback || function () {
  };
  var self = this;

  this.name = 'Embedded';
  this.options = options;
  this.config = helpers.config;
  this._config = helpers.baseconfig;
  this.logger = helpers.logger;
  this.common = helpers.common;
  this.dispatch = helpers.dispatch;

  callback(null, self);
  return self;
}

EmbeddedDiscoveryProvider.prototype.clear = function (key, callback) {
  callback = callback || function () {
  };
  var self = this;

  key = encodeURI(key).replace('.', '_$_');
  self.common.flatGetSet(self._config, key.replace(/:/ig, '.'), null);

  self.save();
  self.dispatch.emit('config:change', key);
  return callback(null);
};

EmbeddedDiscoveryProvider.prototype.get = function (key, callback) {
  callback = callback || function () {
  };
  var self = this;

  key = encodeURI(key).replace('.', '_$_');
  var result = self.common.flatGetSet(self._config, key.replace(/:/ig, '.'));
  callback(null, result);
  return result;
};

EmbeddedDiscoveryProvider.prototype.set = function (key, value, callback) {
  callback = callback || function () {
  };
  var self = this;

  key = encodeURI(key).replace('.', '_$_');
  self.common.flatGetSet(self._config, key.replace(/:/ig, '.'), value);

  if (value === null) {
    return self.clear(key, callback);
  }
  self.save();
  self.dispatch.emit('config:change', key);
  return callback(null);
};

EmbeddedDiscoveryProvider.prototype.storeVersion = function (callback) {
  var self = this;
  return self.get('version', callback);
};

EmbeddedDiscoveryProvider.prototype.storePopulate = function (configuration, callback) {
  callback = callback || function () {
  };
  return callback(null);
};

EmbeddedDiscoveryProvider.prototype.localApply = function (storeVersion, key, callback) {
  var self = this;
  if (typeof key === 'function') {
    callback = key;
    key = null;
  }
  self.config.overrideWithEnvironment();
  return callback(null);
};

EmbeddedDiscoveryProvider.prototype.save = function (callback) {
  callback = callback || function () {
  };
  var self = this;
  var folder = process.env.NODE_CONFIG_DIR || './config';
  var filename = path.join(folder, 'local.json');
  fs.writeFile(filename, JSON.stringify(self._config), callback);
};
