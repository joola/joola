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
  async = require('async'),
  path = require('path');

var config = exports;

config.init = function (callback) {
  config._config = require('config');
  joola.common.extend(exports, config._config);

  /* istanbul ignore next */
  var options = {};
  options.redis = {
    namespace: 'config',
    ttl: 30000,
    connect: function () {
      joola.logger.debug('[config-redis] Connected to redis @ ' + options.redis.host + ':' + options.redis.port + '#' + options.redis.db);
      joola.state.set('config-redis', 'working', 'redis [config-redis] is up.');
    },
    error: function (err) {
      joola.state.set('config-redis', 'failure', 'redis [config-redis] is down: ' + (typeof(err) === 'object' ? err.message : err));
    }
  };

  options.redis.host = config.store.config.redis.host;
  options.redis.port = config.store.config.redis.port;
  options.redis.db = config.store.config.redis.db || 0;
  options.redis.auth = config.store.config.redis.auth;

  /* istanbul ignore if */
  if (options.redis.host === null || options.redis.port === null || options.redis.db === null) {
    //we still don't have any valid redis config.
    return callback(new Error('Failed to find a valid configuration. Missing Redis details.'));
  }
  else
    joola.logger.silly('Loaded configuration.');

  config._config.watch(config, null, function (object, propertyName, priorValue, newValue) {
    joola.dispatch.emit('config:change', propertyName);
  });

  //hook events
  joola.events.on('dispatch:ready', function () {
    joola.dispatch.on('config:change', function (message, key) {
      //if (err)
      //  joola.logger.error('Error while changing configuration deteched: ' + (typeof(err) === 'object' ? err.message : err));
      joola.config.populate(key, function (err) {
        joola.logger.debug('Cache store refreshed due to a change.');
      });
    });
  });

  return callback(null);
};

config.get = function (key, callback) {
  if (callback && typeof callback === 'function')
    return callback(null, config[key]);
  return config[key];
};

config.set = function (key, value, callback) {
  config[key] = value;
  if (callback && typeof callback === 'function')
    return callback(null);
};
