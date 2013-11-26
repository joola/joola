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
  nconf = require('nconf');

nconf.argv()
  .env();

require('nconf-redis');

var config = module.exports = function (options) {
  var options_redis = {
    host: 'localhost',
    port: 6379,
    DB: 0
  };

  joola.config = nconf;
  joola.config.use('redis', { host: options_redis.host, port: options_redis.port, ttl: 0, db: options_redis.DB });

  var redis = joola.config.stores.redis.redis;
  redis.on('connect', function () {
    joola.state.set('config-redis', 'working', 'redis [config-redis] is up.');
  });
  redis.on('error', function (err) {
    joola.state.set('config-redis', 'failure', 'redis [config-redis] is down: ' + err);
  });

  //this is needed to override output of errors by nconf-redis in case of disconnect
  console.dir = function (data) {

  };

  return joola.config;
};

