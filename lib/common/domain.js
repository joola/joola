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
  joola = require('../joola.io'),
  domain = require('domain');

if (process.env.NODE_ENV !== 'test') {
  joola.domain = process.domain = domain.create();
  joola.domain.on('error', function (err) {
    console.log('ERROR! ' + (err && err.message ? err.message : err));
    if (err.stack)
      console.log(err.stack);
    else
      console.trace();

    joola.logger.error('DOMAIN FATAL EXCEPTION! ' + err.message);
    if (err.stack)
      joola.logger.debug(err.stack);

    /* istanbul ignore if*/
    if (!err.dummy) //dummy is used for test purposes.
      process.abort();
  });


//Cannot be tested, since the process is not ours during test.
  /* istanbul ignore next */
  process.on('uncaughtException', function (exception) {
    if (exception.stack)
      console.log(exception.stack);

    joola.logger.error('UNCAUGHT FATAL EXCEPTION: ' + exception.message + '\n', null, function () {
      process.abort();
    });
  });
  /* istanbul ignore next */
  process.on('exit', function (e) {
    joola.logger.error('Received exit signal: ' + e);
    console.log('Received exit signal', e);
    global.shutdown(e);
  });
  /* istanbul ignore next */
  process.on('SIGINT', function () {
    joola.logger.error('Received SIGINT');
    global.shutdown('SIGINT');
  });

  /* istanbul ignore next */
  process.on('SIGHUP', function () {
    joola.logger.error('Received SIGHUP');
    global.shutdown('SIGHUP');
  });
  /* istanbul ignore next */
  process.on('SIGWINCH', function () {
    joola.logger.error('Received SIGWINCH');
    global.shutdown('SIGWINCH');
  });

  //for PM2
  /* istanbul ignore next */
  process.on('SIGTERM', function () {
    joola.logger.error('Received SIGTERM');
    global.silentShutdown('SIGTERM');
  });

  //for nodemon
  /* istanbul ignore next */
  process.once('SIGUSR2', function () {
    joola.logger.error('RECEIVED SIGUSR2');
    global.shutdown('SIGUSR2', function () {
      process.kill(process.pid, 'SIGUSR2');
    });
  });
}