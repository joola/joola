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
  path = require('path'),
  nconf = require('nconf');

require('nconf-redis');

module.exports = nconf;


nconf.argv()
  .env();

var stripKeys = function (obj) {
  Object.keys(obj).forEach(function (key) {
    joola.config[key] = obj[key];
  });
};

nconf.init = function (callback) {
  var rawConfig = null;
  var options = {
    redis: {}
  };

  nconf.options = options;

  options.redis = {
    namespace: 'config',
    connect: function () {
      joola.logger.debug('[config-redis] Connected to redis @ ' + nconf.options.redis.host + ':' + nconf.options.redis.port + '#' + nconf.options.redis.db);
      joola.state.set('config-redis', 'working', 'redis [config-redis] is up.');
    },
    error: function (err) {
      joola.state.set('config-redis', 'failure', 'redis [config-redis] is down: ' + err);
    }
  };

  var configPath = path.join(__dirname, '../../config/baseline.json');
  //we don't have a valid redis store yet, let's find a config file.
  nconf.file({ file: configPath });

  rawConfig = require(configPath);

  options.redis.host = nconf.get('store:config:redis:host');
  options.redis.port = nconf.get('store:config:redis:port');
  options.redis.db = nconf.get('store:config:redis:db') || 0;
  options.redis.auth = nconf.get('store:config:redis:auth');

  if (options.redis.host == null || options.redis.port == null || options.redis.db == null) {
    //we still don't have any valid redis config.
    return callback(new Error('Failed to find a valid config file [' + configPath + '].'));
  }
  else
    joola.logger.silly('Loaded configuration from [' + configPath + ']');

  joola.config.use('redis', options.redis);
  joola.config.redis = joola.config.stores.redis.redis;

  //check that we have a valid configuration
  joola.config.get('version', function (err, value) {
    if (err)
      return callback(err);

    if (!value) {
      joola.logger.warn('Found an empty configuration store, building initial...');
      Object.keys(rawConfig).forEach(function (key) {
        joola.config.set(key, rawConfig[key]);
      });
      joola.config.set('version', rawConfig._version);
    }
    else {
      joola.logger.silly('Found a valid configuration store.');
    }

    joola.config.redis.smembers(nconf.stores.redis.namespace + ':keys', function (err, keys) {
      if (err)
        return callback(err);

      var counter = 0, expected = keys.length;
      if (expected == 0)
        return callback(null);

      //stripKeys(keys);

      keys.forEach(function (key) {
        joola.config.get(key, function (err, value) {
          counter++;
          joola.config[key] = value;
          if (counter == expected)
            return callback(null);
        });
      });
    });
  });

  //override set
  joola.config._set = joola.config.set;
  joola.config.set = function (key, value, expire, callback) {
    if (typeof expire === 'function') {
      expire = null;
      callback = expire;
    }
    callback = callback || function () {
    };

    joola.config._set(key, value, function (err) {
      if (err)
        return callback(err);

      joola.dispatch.emit('config', 'change', {}, function () {

      });
      if (expire)
        joola.config.redis.expire(joola.config.namespace + ':' + key, expire);
      return callback(null);
    });
  };

  //hook events
  joola.events.on('dispatch:ready', function () {
    joola.dispatch.on('config', 'change', function (err, message) {
      if (err)
        joola.logger.error('Error while changing configuration deteched: ' + err);

      joola.config.init(function (err) {
        joola.logger.info('Cache store refreshed due to a change.');
      });
    });
  });
};
