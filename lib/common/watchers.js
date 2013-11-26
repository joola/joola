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

//check for any event loop block
function watch_eventloop () {
  var lastTime = new Date().getTime();
  setInterval(function () {
    var delta = new Date().getTime() - lastTime;
    if (delta > 2000) {
      joola.logger.warn('Blocked event-loop, ' + delta.toString() + 'ms');
    }
    lastTime = new Date().getTime();
  }, 1000);
}

watch_eventloop();
