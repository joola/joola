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
  nconf = require('nconf');

nconf.argv()
  .env();

require('nconf-redis');

nconf.init = function (callback) {
  var redis = nconf.stores.redis.redis;
  redis.smembers(nconf.stores.redis.namespace+ ':keys', function (err, keys) {
    if (err)
      return callback(err);

    var counter = 0, expected = keys.length;
    keys.forEach(function (key) {
      nconf.get(key, function (err, value) {
        counter++;
        nconf[key] = value;
        if (counter == expected)
          return callback(null);
      });
    });
  });
};

var config = module.exports = function (options) {
  var options_redis = {
    host: 'localhost',
    port: 6379,
    db: 0,
    ttl: 0,
    namespace: 'config',
    connect: function () {
      joola.state.set('config-redis', 'working', 'redis [config-redis] is up.');
    },
    error: function (err) {
      joola.state.set('config-redis', 'failure', 'redis [config-redis] is down: ' + err);
    }
  };

  joola.config = nconf;
  joola.config.use('redis', options_redis);

  return joola.config;
};

