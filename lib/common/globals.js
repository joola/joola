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
global.shutdown = function (code) {
  if (stopped)
    return;
  joola.logger.info('Gracefully shutting down, code: ' + code);
  joola.state.set('core', 'stop', 'received code' + code);
  joola.dispatch.emitWait('nodes', 'state:change', [joola.UID, joola.state.get()], function () {
    stopped = true;
    process.exit(code || 0);
  });
};
