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
  callback = callback || function () {
  };
  stats.enabled = false;
  var config = joola.config.get('store:stats');
  /* istanbul ignore if */
  if (!config)
    return callback(null);
  /* istanbul ignore next */
  if (config.hasOwnProperty('enabled') && !config.enabled)
    return callback(null);
  /* istanbul ignore if */
  if (!config.punt.port)
    return callback(null);

  stats.enabled = true;
  stats.sock = punt.connect('0.0.0.0:' + config.punt.port);
  joola.logger.debug('Punt stats interface bound on port [' + config.punt.port + '].');
  return callback(null);
};

stats.emit = function (stat) {
  var base = {
    timestamp: new Date(),
    node: joola.UID
  };
  var _doc = joola.common.extend(base, stat);
  joola.beacon.insert({user: joola.STATS_USER}, '_stats', _doc.event, _doc, {}, function (err) {
    /* istanbul ignore if */
    if (err)
      joola.logger.trace('Error while saving stats: ' + err);
  });
  if (stats.enabled)
    stats.sock.send({topic: _doc.event, payload: _doc});
};

stats.init();