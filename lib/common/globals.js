/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var stopped = false;
global.shutdown = function (code, callback) {
  if (stopped)
    return;

  stopped = true;
  joola.logger.info('Gracefully shutting down, code: ' + code);
  joola.state.set('core', 'stop', 'received code [' + code + ']+');
  joola.dispatch.emit('nodes:state:change', [joola.UID, joola.state.get()]);
  if (typeof callback === 'function')
    return joola.redis.del('nodes:' + joola.UID, callback);

  setTimeout(function () {
    process.exit(code || 0);
  }, 10);
};

global.emptyfunc = function () {

};

global.rt = function () {
  joola.dispatch.roundtrip(function (err, delta) {
    if (err)
      return console.log('Roundtrip: ' + err);
    return console.log('Roundtrip: ' + delta + 'ms');
  });
};