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
  domain = require('domain');

joola.domain = process.domain = domain.create();
joola.domain.on('error', function (domain, err) {
  console.log(err);
  console.log(err.stack);

  joola.logger.error('FATAL EXCEPTION! ' + err.message);
  joola.logger.debug(err.stack);
});
process.on('uncaughtException', function (exception) {
  console.log('FATAL EXCEPTION: ' + exception.message);
  console.log(exception.stack);

  joola.logger.error('FATAL EXCEPTION: ' + exception.message + '\n' + exception.stack, null, function () {
    process.exit(1);
  });
});
/*
process.on('exit', function () {
  joola.logger.info('Exiting...')
});
*/