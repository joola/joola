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

  semver = require('semver'),
  async = require('async'),
  path = require('path');

var config = exports;

config.init = function (callback) {
  //base config object, following the require config has been parsed and available for the local node. May differ from central.
  config._config = require('config');
  joola.common.extend(exports, config._config);

  //hook events
  joola.events.on('dispatch:ready', function () {
    joola.dispatch.on('config:change', function (message, key) {
      joola.config.populate(key, function (err) {
        if (err)
          return joola.logger.warn('Failure populating configuration: ' + err);
        return joola.logger.debug('Cache store refreshed due to a change [' + key + '].');
      });
    });
  });

  //watch for _config changes
  config._config.watch(config._config, null, function (object, propertyName, priorValue, newValue) {
    joola.dispatch.emit('config:change', propertyName);
  });

  //connect to the central configuration store
  joola.redis = config.redis = require('./redis')(joola.config.store.config.redis);
  //check for existing configuration
  config.storeVersion(function (err, version) {
    if (err)
      return callback(err);

    if (version) {
      //we have an existing config
      if (semver.gt(config.get('version'), version)) {
        //we need to replace the existing version
        joola.logger.warn('Found an out-dated configuration store with version [' + version + '], updating to version [' + config.get('version') + '].');
        config.storeFlush(function () {
          if (err)
            return callback(err);
          config.storePopulate(config._config, function (err) {
            if (err)
              return callback(err);
            //store is now populated with local copy

            return callback(null);
          });
        });
      }
      else if (semver.eq(version, config.get('version'))) {
        joola.logger.info('Found a valid configuration store with version [' + version + '].');
        return callback(null);
      }
      else {
        joola.logger.info('Found an out-dated local configuration with version [' + version + '].');
        //we need to override local configuration with central
        config.localApply(version, function (err) {
          if (err)
            return callback(err);

          return callback(null);
        });
      }
    }
    else {
      //we have an empty store, let's populate it
      config.storeFlush(function () {
        if (err)
          return callback(err);
        config.storePopulate(config._config, function (err) {
          if (err)
            return callback(err);
          //store is now populated with local copy

          return callback(null);
        });
      });
    }
  });
};

config.get = function (key, callback) {
  if (callback && typeof callback === 'function')
    return callback(null, config._config[key]);
  return config._config[key];
};

config.set = function (key, value, callback) {
  config._config[key] = value;
  if (callback && typeof callback === 'function')
    return callback(null);
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
    var value = cfg[1];

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

    return callback();
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
    async.series(calls, callback);
  });
};