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
  async = require('async'),
  punt = require('punt');

var stats = exports;
var stats_buffer = [];

stats.init = function(callback) {
  callback = callback || function() {};
  stats.enabled = false;
  var config = joola.config.get('store:stats');

  /* istanbul ignore if */
  if (!config)
    return callback(null);
  /* istanbul ignore next */
  if (config.hasOwnProperty('enabled') && !config.enabled)
    return callback(null);

  stats.enabled = true;
  setInterval(stats.write, 1000);

  if (!config.punt)
    return callback(null);
  /* istanbul ignore if */
  if (config.punt && !config.punt.port)
    return callback(null);

  stats.sock = punt.connect('0.0.0.0:' + config.punt.port);
  joola.logger.debug('Punt stats interface bound on port [' + config.punt.port + '].');

  return callback(null);
};

stats.emit = function(stat) {
  if (stats.enabled) {
    var base = {
      timestamp: new Date(),
      node: joola.UID
    };
    var _doc = joola.common.extend(base, stat);
    _doc._type = _doc.event;
    stats_buffer.push(_doc);
    if (stats.sock)
      stats.sock.send({
        topic: _doc.event,
        payload: _doc
      });
  }
};

stats.write = function() {
  var _stats_buffer = stats_buffer.splice(0);
  async.mapSeries(_stats_buffer, function(_doc, cb) {
    joola.beacon.insert({
      user: joola.STATS_USER
    }, '.joola-stats', '.joola-stats', _doc, {}, function(err) {
      if (err)
        return cb(err);
      return cb(null);
    });
  }, function(err) {
    if (err)
      joola.logger.error('Error while saving stats: ' + err);
  });
};

stats.init();
