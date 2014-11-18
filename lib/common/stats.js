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
  punt = require('punt');

var stats = exports;

stats.init = function (callback) {
  callback = callback || emptyfunc;
  var config = joola.config.get('store:stats');
  if (!config)
    return callback(null);
  if (config.hasOwnProperty('enabled') && !config.enabled)
    return callback(null);
  if (!config.punt.port)
    return callback(null);

  stats.sock = punt.connect('0.0.0.0:' + config.punt.port);
  joola.logger.info('Punt stats interface bound on port [' + config.punt.port + '].');
  return callback(null);
};

stats.emit = function (stat) {
  var base = {
    timestamp: new Date(),
    node: joola.UID
  };
  var _doc = joola.common.extend(base, stat);
  stats.sock.send({topic: _doc.event, payload: _doc});
  joola.beacon.insert({user: joola.STATS_USER}, '_stats', _doc.event, _doc, {}, function (err) {
    if (err)
      joola.logger.trace('Error while saving stats: ' + err);
  });
};


stats.init();