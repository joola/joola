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
  EventEmitter2 = require('eventemitter2').EventEmitter2;

var stats = new EventEmitter2({wildcard: true, newListener: true});
stats._id = 'stats';

module.exports = exports = stats;

var statsEvents = function () {
  if (joola.io.sockets) {
    joola.redis.get('stats:joola.io.manage:events:emit', function (err, value) {
      joola.io.sockets.emit('stats:events', value);
    });

  }
};

setInterval(statsEvents, 1000);