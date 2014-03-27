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
  joola = require('../joola.io'),

  _redis = require('redis');

var redis = module.exports = function (options) {
  var self = redis;

  options = options || {};
  self.namespace = options.namespace || 'engine';
  self.host = options.host || 'localhost';
  self.port = options.port || 6379;
  self.db = options.db || 0;
  self.redis = _redis.createClient(options.port, options.host);
  self.connect = options.connect || function () {
    joola.state.set('core', 'working', 'redis [runtime-redis] is up.');
  };
  self.error = options.error || function (err) {
    joola.state.set('core', 'failure', 'redis [runtime-redis] is down: ' + (typeof(err) === 'object' ? err.message : err));
  };

  self.redis.select(self.db);
  if (options.auth)
    self.redis.auth(options.auth);

  if (self.connect)
    self.redis.on('connect', self.connect);

  if (self.error)
    self.redis.on('error', self.error);

  joola.logger.debug('[runtime-redis] Connected to redis @ ' + self.host + ':' + self.port + '#' + self.db);

  return self.redis;
};

