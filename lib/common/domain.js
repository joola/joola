/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var
  domain = require('domain');

if (process.env.NODE_ENV != 'test') {
  joola.domain = process.domain = domain.create();
  joola.domain.on('error', function (domain, err) {
    console.log('ERROR! ' + domain, err);
    if (err.stack)
      console.log(err.stack);
    else
      console.trace();

    joola.logger.error('FATAL EXCEPTION! ' + err.message);
    if (err.stack)
      joola.logger.debug(err.stack);
    shutdown(1);
  });
  process.on('uncaughtException', function (exception) {
    console.log('FATAL EXCEPTION: ' + exception.message);
    if (exception.stack)
      console.log(exception.stack);

    joola.logger.error('FATAL EXCEPTION: ' + exception.message + '\n', null, function () {
      global.shutdown(1);
    });
  });
  process.on('exit', function () {
    global.shutdown(0);
  });
  process.on('SIGINT', function () {
    global.shutdown(0);
  });
}