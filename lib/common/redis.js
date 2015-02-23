/**
 *  joola
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

'use strict';

var
  joola = require('../joola'),

  _redis = require('redis'),
  url = require('url'),
  querystring = require('querystring');

var redis = module.exports = function (options) {
  var self = redis;

  options = options || {};
  if (!options.dsn)
    return null;
  self.namespace = options.namespace || 'engine';
  var parsed_url = url.parse(options.dsn);
  var parsed_auth = (parsed_url.auth || '').split(':');

  self.redisOptions = querystring.parse(parsed_url.query);
  self.host = parsed_url.host.split(':')[0];
  self.port = parsed_url.port || 6379;
  self.db = parsed_auth[0];
  self.auth = parsed_auth[1];

  self.redis = _redis.createClient(self.port, self.host, self.redisOptions);
  self.connect = options.connect || function () {
    joola.state.set('runtime-redis', 'working', 'redis [runtime-redis] is up.');
  };
  /* istanbul ignore next */
  self.error = options.error || function (err) {
    joola.state.set('runtime-redis', 'failure', 'redis [runtime-redis] is down: ' + (typeof(err) === 'object' ? err.message : err));
  };

  self.redis.select(self.db);
  /* istanbul ignore if */
  if (self.auth)
    self.redis.auth(self.auth);

  if (self.connect)
    self.redis.on('connect', self.connect);

  if (self.error)
    self.redis.on('error', self.error);

  joola.logger.debug('[runtime-redis] Connected to redis @ ' + self.host + ':' + self.port + '#' + self.db);

  return self.redis;
};

