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
  joola = require('../joola'),
  Embedded = require('./providers/embedded'),

  ce = require('cloneextend'),
  _ = require('underscore'),
  semver = require('semver'),
  async = require('async'),

  path = require('path');

var config = exports;

/* istanbul ignore if */
if (process.env.PORT && !process.env.JOOLA_CONFIG_INTERFACES_WEBSERVER_PORT)
  process.env.JOOLA_CONFIG_INTERFACES_WEBSERVER_PORT = process.env.PORT;

config.overrideWithEnvironment = function () {
  var configIdentifier = 'JOOLA_CONFIG_';
  var joolaEnvironmentVars = {};
  Object.keys(process.env).forEach(function (key) {
    if (key.substring(0, configIdentifier.length) === configIdentifier) {
      joolaEnvironmentVars[key.replace(configIdentifier, '').replace(/_/ig, '.').toLowerCase()] = process.env[key];
    }
  });
  Object.keys(joolaEnvironmentVars).forEach(function (key) {
    var value = joolaEnvironmentVars[key];
    if (['true', 'false'].indexOf(value) > -1)
      value = value === 'true';

    joola.logger.debug('Setting environment varialbe for configuration [' + key + ']: ' + value);
    joola.common.flatGetSet(config._config, key, value);
  });
};

config.init = function (callback) {
  var self = this;
  config.initialized = false;
  //base config object, following the require config has been parsed and available for the local node. May differ from central.
  config._config = require('config');
  config.namespace = joola.config.get('store:config:redis:namespace') || process.env.JOOLA_CONFIG_STORE_REDIS_NAMESPACE || 'joola';
  var helpers = {
    UID: joola.UID,
    config: self,
    baseconfig: config._config,
    common: joola.common,
    logger: joola.logger,
    dispatch: joola.dispatch,
    state: joola.state
  };
  config.provider = new Embedded(null, helpers);
  joola.common.extend(exports, config._config);

//hook events
  joola.events.on('dispatch:ready', function () {
    joola.dispatch.on('config:change', function (message, key) {
      joola.logger.debug('Detected configuration change [' + key + '].');
      config.provider.localApply('Dispatch Change', key, function (err) {
        /* istanbul ignore if */
        if (err)
          return joola.logger.warn('Failure populating configuration: ' + err);
        return joola.logger.debug('Config store refreshed due to a change [' + key + '].');
      });
    });
  });

  var storeEnabled = false;
  var storeConfig = joola.config.get('store:config');
  if (storeConfig) {
    if (storeConfig.hasOwnProperty('enabled'))
      storeEnabled = storeConfig.enabled;
    else
      storeEnabled = true;
  }
  if (storeEnabled && storeConfig.zookeeper && storeConfig.zookeeper.connectionstring) {
    config.provider = new require('./providers/zookeeper')(null, helpers);
  }
  else if (storeEnabled && storeConfig.redis && storeConfig.redis.dsn) {
    config.provider = new require('./providers/redis')(null, helpers);
  }

  if (!storeEnabled) {
    joola.events.emit('config:done');
    return callback(null);
  }

  self.provider.storeVersion(function (err, storeVersion) {
    /* istanbul ignore if */
    if (err)
      return callback(err);

    var fileVersion = config._config.version || '0.0.0';

    /* istanbul ignore if */
    if (storeVersion) {
      //we have an existing config
      if (semver.gt(fileVersion, storeVersion)) {
        //we need to replace the existing version
        joola.logger.warn('Found an out-dated central configuration store with version [' + storeVersion + '], updating to version [' + fileVersion + '].');

        self.provider.storePopulate(config._config, function (err) {
          /* istanbul ignore if */
          if (err)
            return callback(err);
          //store is now populated with local copy

          joola.events.emit('config:done');
          return callback(null);
        });
      }
      else if (semver.eq(fileVersion, storeVersion)) {
        joola.logger.info('Found a valid configuration store with version [' + fileVersion + '].');
        self.provider.localApply(fileVersion, function (err) {
          /* istanbul ignore if */
          if (err)
            return callback(err);

          joola.events.emit('config:done');
          return callback(null);
        });
      }
      else {
        joola.logger.info('Found an out-dated local configuration with version [' + fileVersion + '].');
        //we need to override local configuration with central
        self.provider.localApply(storeVersion, function (err) {
          /* istanbul ignore if */
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
      self.provider.storePopulate(config._config, function (err) {
        if (err)
          return callback(err);
        //store is now populated with local copy
        joola.events.emit('config:done');
        return callback(null);
      });
    }
  });
}
;

config.clear = function (key, callback) {
  return config.provider.clear(key, callback);
};

config.get = function (key, callback) {
  if (!config.provider)
    return;
  return config.provider.get(key, callback);
};

config.set = function (key, value, callback) {
  return config.provider.set(key, value, callback);
};