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
  async = require('async');

module.exports = RedisDiscoveryProvider;

function RedisDiscoveryProvider(options, helpers, callback) {
  if (!(this instanceof RedisDiscoveryProvider)) return new RedisDiscoveryProvider(options, helpers, callback);
  callback = callback || function () {
  };
  var self = this;

  this.name = 'Redis';

  this.options = options;
  this.config = helpers.config;
  this._config = helpers.baseconfig;
  this.logger = helpers.logger;
  this.common = helpers.common;
  this.dispatch = helpers.dispatch;

  this.namespace = self.config.get('store:config:redis:namespace') || process.env.JOOLA_CONFIG_STORE_REDIS_NAMESPACE || 'joola';
  this.localChange = false;

  var redisConfig = self.config.get('store:config:redis');
  /* istanbul ignore if */
  if (redisConfig && typeof redisConfig.enabled === 'undefined')
    redisConfig.enabled = true;
  /* istanbul ignore if */
  if (process.env.JOOLA_CONFIG_STORE_CONFIG_REDIS_DSN)
    redisConfig.dsn = process.env.JOOLA_CONFIG_STORE_CONFIG_REDIS_DSN;

  //connect to the central configuration store
  self.redis = require('../../common/redis')(redisConfig);

  return callback(null);
}

RedisDiscoveryProvider.prototype.clear = function (key, callback) {
  callback = callback || function () {
  };
  var self = this;

  key = encodeURI(key).replace('.', '_$_');
  self.common.flatGetSet(self._config, key.replace(/:/ig, '.'), null);
  /* istanbul ignore else */
  self.redis.keys(self.namespace + ':config:' + key.replace(/\./ig, ':') + ':*', function (err, keys) {
    async.mapSeries(keys, function (key, callback) {
      self.redis.del(key, callback);
    }, function (err) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      self.localChange = true;
      self.dispatch.emit('config:change', key);
      return callback(null);
    });
  });
};

RedisDiscoveryProvider.prototype.get = function (key, callback) {
  var self = this;
  key = encodeURI(key).replace('.', '_$_');
  var result = self.common.flatGetSet(self._config, key.replace(/:/ig, '.'));
  if (callback && typeof callback === 'function')
    return callback(null, result);
  return result;
};

RedisDiscoveryProvider.prototype.set = function (key, value, callback) {
  callback = callback || function () {
  };
  var self = this;
  key = encodeURI(key).replace('.', '_$_');
  self.common.flatGetSet(self._config, key.replace(/:/ig, '.'), value);

  if (value === null) {
    return self.clear(key, callback);
  }
  else if (typeof value === 'object') {
    var flat = self.common.flatten(value);
    async.mapSeries(flat, function (f, callback) {
      var _key = key + ':' + f[0].replace(/\./ig, ':');
      var value = f[1];

      if (value)
        self.redis.set(self.namespace + ':config:' + _key.replace(/\./ig, ':'), value, callback);
      else
        return callback(null);
    }, function (err) {
      /* istanbul ignore if */
      if (err)
        return callback(err);
      self.localChange = true;
      self.dispatch.emit('config:change', key);
      return callback(null);
    });
  }
  else {
    self.redis.set(self.namespace + ':config:' + key.replace(/\./ig, ':'), value, function (err) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      self.dispatch.emit('config:change', key);
      return callback(null);
    });
  }
  return null;
};

RedisDiscoveryProvider.prototype.storeVersion = function (callback) {
  var self = this;
  self.redis.get(self.namespace + ':config:version', function (err, value) {
    return callback(err, value);
  });
};

RedisDiscoveryProvider.prototype.storePopulate = function (configuration, callback) {
  var self = this;
  self.logger.trace('Populating local configuration into central store, version [' + configuration.version + '].');
  var flatConfig = self.common.flatten(configuration);
  var calls = [];
  flatConfig.forEach(function (cfg) {
    var key = cfg[0];
    var value;
    if (key.indexOf('user') > -1 && key.indexOf('password') > -1) {
      value = self.common.hashPassword(cfg[1]);
    }
    else
      value = cfg[1];

    if (value !== null && typeof value !== 'undefined') {
      var call = function (callback) {
        if (typeof value === 'object')
          value = '__$$__' + JSON.stringify(value);
        self.redis.set(self.namespace + ':config:' + key.replace(/\./ig, ':'), value, callback);
      };
      calls.push(call);
    }
  });
  async.series(calls, function (err) {
    /* istanbul ignore if */
    if (err)
      return callback(err);

    self.localApply(configuration.version, callback);
  });
};


RedisDiscoveryProvider.prototype.localApply = function (storeVersion, key, callback) {
  if (typeof key === 'function') {
    callback = key;
    key = null;
  }
  var self = this;
  if (self.localChange)
    return (self.localChange = false);

  var localVersion = self._config.version;
  self.logger.debug('Applying central configuration to local store, version [' + storeVersion + '] -> [' + localVersion + '].');
  //let's get the central config and apply it on our object
  if (key)
    key = self.namespace + ':config:' + key + ':*';
  else
    key = self.namespace + ':config:*';

  self.redis.keys(key, function (err, keys) {
    //first let's delete the existing workspaces config
    if (!self.initialized) {
      self.initialized = true;
      delete self._config.workspaces;
    }

    var calls = [];
    keys.forEach(function (key) {
      var call = function (callback) {
        self.redis.get(key, function (err, value) {
          /* istanbul ignore if */
          if (err)
            return callback(err);

          key = key.replace(/:/ig, '.').replace(self.namespace + '.config.', '');
          if (value.indexOf('__$$__') > -1)
            value = JSON.parse(value.replace('__$$__', ''));
          else if (['true', 'false'].indexOf(value) > -1)
            value = value === 'true';

          self.common.flatGetSet(self._config, key, value);
          return callback(null);
        });
      };
      calls.push(call);
    });
    async.series(calls, function (err) {
      self.config.overrideWithEnvironment();
      return callback(err);
    });
  });
};
