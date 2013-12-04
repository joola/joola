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

var onlyonce = false;

nconf.init = function (callback) {
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

  options.redis.host = nconf.get('store:config:redis:host');
  options.redis.port = nconf.get('store:config:redis:port');
  options.redis.db = nconf.get('store:config:redis:db') || 0;
  options.redis.auth = nconf.get('store:config:redis:auth');

  if (options.redis.host === null || options.redis.port === null || options.redis.db === null) {
    //we still don't have any valid redis config.
    return callback(new Error('Failed to find a valid config file [' + configPath + '].'));
  }
  else
    joola.logger.silly('Loaded configuration from [' + configPath + ']');

  joola.config.use('redis', options.redis);
  joola.config.redis = joola.config.stores.redis.redis;

  nconf.validate(configPath, function () {
    joola.config.populate(callback);


    //override set
    joola.config._set = joola.config.set;
    joola.config.set = function (key, value, expire, callback) {
      if (typeof expire === 'function') {
        callback = expire;
        expire = null;
      }
      callback = callback || emptyfunc;

      joola.config._set(key, value, function (err) {
        if (err)
          return callback(err);

        if (joola.dispatch)
          joola.dispatch.emit('config:change', {}, function () {

          });
        if (expire)
          joola.config.redis.expire(joola.config.namespace + ':' + key, expire);
        return callback(null);
      });
    };
  });

  //hook events
  joola.events.on('dispatch:ready', function () {
    joola.dispatch.on('config:change', function (err, message) {
      if (err)
        joola.logger.error('Error while changing configuration deteched: ' + err);

      joola.config.populate(function (err) {
        joola.logger.info('Cache store refreshed due to a change.');
      });
    });
  });


};

nconf.validate = function (configPath, callback) {
  var rawConfig = require(configPath);
  //check that we have a valid configuration
  joola.config.get('version', function (err, value) {
    if (err)
      return callback(err);

    if (!value) {
      joola.logger.warn('Found an empty configuration store, building initial...');
      var expected = Object.keys(rawConfig).length;
      var counter = 0;
      Object.keys(rawConfig).forEach(function (key) {
        joola.config.set(key, rawConfig[key], function () {
          counter++;
          if (expected == counter)
            return callback(null);
        });
      });
      joola.config.set('version', rawConfig._version);

    }
    else {
      joola.logger.silly('Found a valid configuration store.');
      return callback(null);
    }
  });
};

nconf.populate = function (callback) {
  joola.config.redis.smembers(nconf.stores.redis.namespace + ':keys', function (err, keys) {
    if (err)
      return callback(err);

    var counter = 0, expected = keys.length;
    if (expected === 0)
      return callback(null);

    keys.forEach(function (key) {
      joola.config.get(key, function (err, value) {
        counter++;
        joola.config[key] = value;
        if (counter == expected) {
          joola.events.emit('config:done');
          return callback(null);
        }
      });
    });
  });


};
