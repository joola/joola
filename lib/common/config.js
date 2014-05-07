/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  joola = require('../joola.io'),

  _ = require('underscore'),
  traverse = require('traverse'),
  semver = require('semver'),
  async = require('async'),
  path = require('path');

var config = exports;

process.env.NODE_CONFIG_PERSIST_ON_CHANGE = 'N';

if (process.env.PORT)
  process.env.JOOLAIO_CONFIG_INTERFACES_WEBSERVER_PORT = process.env.PORT;

config.overrideWithEnvironment = function () {
  var configIdentifier = 'JOOLAIO_CONFIG_';
  var joolaEnvironmentVars = {};
  Object.keys(process.env).forEach(function (key) {
    if (key.substring(0, configIdentifier.length) === configIdentifier) {
      joolaEnvironmentVars[key.replace(configIdentifier, '').replace(/_/ig, '.').toLowerCase()] = process.env[key];
    }
  });
  if (joolaEnvironmentVars) {
    Object.keys(joolaEnvironmentVars).forEach(function (key) {
      var value = joolaEnvironmentVars[key];
      joola.logger.warn('Setting environment varialbe for configuration [' + key + ']: ' + value);
      joola.common.flatGetSet(config._config, key, value);
    });
  }
};

config.init = function (callback) {
  //base config object, following the require config has been parsed and available for the local node. May differ from central.
  config._config = require('config');
  //config.overrideWithEnvironment();

  //first of all wipe any left behind configuration.
  config.shouldWatch = true;
  joola.common.extend(exports, config._config);

  //hook events
  joola.events.on('dispatch:ready', function () {
    joola.dispatch.on('config:change', function (message, key) {
      if (config.shouldWatch) {
        joola.logger.debug('Detected central configuration change [' + key + '].');
        config.localApply('Dispatch Change', function (err) {
          if (err)
            return joola.logger.warn('Failure populating configuration: ' + err);
          return joola.logger.debug('Cache store refreshed due to a change [' + key + '].');
        });
      }
    });
  });

  //we need to make sure we have the valid redis store configuration, also from environment variables
  var redisConfig = joola.config.get('store:config:redis');

  if (process.env.JOOLAIO_CONFIG_STORE_CONFIG_REDIS_DSN)
    redisConfig.dsn = process.env.JOOLAIO_CONFIG_STORE_CONFIG_REDIS_DSN;
  if (process.env.JOOLAIO_CONFIG_STORE_CONFIG_REDIS_HOST)
    redisConfig.host = process.env.JOOLAIO_CONFIG_STORE_CONFIG_REDIS_HOST;
  if (process.env.JOOLAIO_CONFIG_STORE_CONFIG_REDIS_PORT)
    redisConfig.port = process.env.JOOLAIO_CONFIG_STORE_CONFIG_REDIS_PORT;
  if (process.env.JOOLAIO_CONFIG_STORE_CONFIG_REDIS_DB)
    redisConfig.db = process.env.JOOLAIO_CONFIG_STORE_CONFIG_REDIS_DB;
  if (process.env.JOOLAIO_CONFIG_STORE_CONFIG_REDIS_PASS)
    redisConfig.pass = process.env.JOOLAIO_CONFIG_STORE_CONFIG_REDIS_PASS;

  //connect to the central configuration store
  joola.redis = config.redis = require('./redis')(redisConfig);
  //check for existing configuration
  config.storeVersion(function (err, version) {
    if (err)
      return callback(err);

    var configVersion = config.get('version') || '0.0.0';
    if (version) {
      //we have an existing config
      if (semver.gt(configVersion, version)) {
        //we need to replace the existing version
        joola.logger.warn('Found an out-dated central configuration store with version [' + version + '], updating to version [' + configVersion + '].');
        config.storeFlush(function () {
          if (err)
            return callback(err);
          config.storePopulate(config._config, function (err) {
            if (err)
              return callback(err);
            //store is now populated with local copy

            joola.events.emit('config:done');
            return callback(null);
          });
        });
      }
      else if (semver.eq(version, configVersion)) {
        joola.logger.info('Found a valid configuration store with version [' + version + '].');
        config.localApply(version, function (err) {
          if (err)
            return callback(err);

          joola.events.emit('config:done');
          return callback(null);
        });
      }
      else {
        joola.logger.info('Found an out-dated local configuration with version [' + version + '].');
        //we need to override local configuration with central
        config.localApply(version, function (err) {
          if (err)
            return callback(err);

          joola.events.emit('config:done');
          return callback(null);
        });
      }
    }
    else {
      //we have an empty store, let's populate it
      config.overrideWithEnvironment();

      config.storeFlush(function () {
        if (err)
          return callback(err);
        config.storePopulate(config._config, function (err) {
          if (err)
            return callback(err);
          //store is now populated with local copy
          joola.events.emit('config:done');
          return callback(null);
        });
      });
    }
  });
};

config.get = function (key, callback) {
  var result = joola.common.flatGetSet(config._config, key.replace(/:/ig, '.'));

  if (callback && typeof callback === 'function')
    return callback(null, result);
  return result;
};


config.clear = function (key, callback) {
  callback = callback || function () {
  };

  config.shouldWatch = false;

  joola.common.flatGetSet(config._config, key.replace(/:/ig, '.'), null);
  joola.redis.keys('config:' + key.replace(/\./ig, ':'), function (err, keys) {
    async.mapSeries(keys, function (key, callback) {
      joola.redis.del(key, callback);
    }, function (err) {
      if (err)
        return callback(err);

      joola.dispatch.emit('config:change', key);
      setTimeout(function () {
        config.shouldWatch = true;
      }, 100);
      return callback(null);
    });
  });
};

config.set = function (key, value, callback) {
  callback = callback || function () {
  };

  config.shouldWatch = false;
  joola.common.flatGetSet(config._config, key.replace(/:/ig, '.'), value);

  if (value === null) {
    return config.clear(key, callback);
  }
  else if (typeof value === 'object') {
    var flat = joola.common.flatten(value);
    async.mapSeries(flat, function (f, callback) {
      var _key = key + ':' + f[0].replace(/\./ig, ':');
      var value = f[1];

      if (value)
        joola.redis.set('config:' + _key.replace(/\./ig, ':'), value, callback);
      else
        return callback(null);
    }, function (err) {
      if (err)
        return callback(err);

      joola.dispatch.emit('config:change', key);
      setTimeout(function () {
        config.shouldWatch = true;
      }, 100);
      return callback(null);
    });
  }
  else {
    joola.redis.set('config:' + key.replace(/\./ig, ':'), value, function (err) {
      if (err)
        return callback(err);

      joola.dispatch.emit('config:change', key);
      setTimeout(function () {
        config.shouldWatch = true;
      }, 100);
      return callback(null);
    });
  }
  return null;
};

config.storeVersion = function (callback) {
  config.redis.get('config:version', function (err, value) {
    return callback(err, value);
  });
};

config.storeFlush = function (callback) {
  joola.logger.trace('Flushing configuration.');
  config.redis.del('config', callback);
};

config.storePopulate = function (configuration, callback) {
  joola.logger.trace('Populating local configuration into central store, version [' + configuration.version + '].');
  var flatConfig = joola.common.flatten(configuration);
  var calls = [];
  flatConfig.forEach(function (cfg) {
    var key = cfg[0];
    var value;
    if (key.indexOf('_password') > -1) {
      value = joola.auth.hashPassword(cfg[1]);
    }
    else
      value = cfg[1];

    if (value) {
      var call = function (callback) {
        config.redis.set('config:' + key.replace(/\./ig, ':'), value, callback);
      };
      calls.push(call);
    }
  });
  async.series(calls, function (err) {
    if (err)
      return callback(err);

    config.localApply(configuration.version, callback);
  });
};

config.localApply = function (version, callback) {
  joola.logger.debug('Applying central configuration to local store, version [' + config._config.version + '] -> [' + version + '].');

  //first let's delete the existing config
  //let's get the central config and apply it on our object
  joola.redis.keys('config:*', function (err, keys) {
    var calls = [];
    keys.forEach(function (key) {
      var call = function (callback) {
        joola.redis.get(key, function (err, value) {
          if (err)
            return callback(err);

          key = key.replace(/:/ig, '.').replace('config.', '');
          joola.common.flatGetSet(config._config, key, value);
          return callback(null);
        });
      };
      calls.push(call);
    });
    async.series(calls, function (err) {
      config.overrideWithEnvironment();
      return callback(err);
    });
  });
};
