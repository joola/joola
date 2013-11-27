/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var logger = exports;
logger._id = 'logger';

if (process.env.NODE_ENV == 'test') {
  logger = module.exports = {
    log: function () {
    },
    silly: function () {

    },
    debug: function () {

    },
    info: function () {

    },
    error: function () {

    },
    notice: function () {

    },
    setLevel: function () {

    }};
}
else {
  logger._log = function (level, message, callback) {
    switch (level) {
      case 'debug':
      case 'info':
      case 'warn':
      case 'error':
        break;
      case 'silly':
        level = 'debug';
        break;
      default:
        break;
    }

    if (typeof message === 'object')
      message = '[' + new Date().format('hh:nn:ss.fff') + '] ' + JSON.stringify(message);
    else
      message = '[' + new Date().format('hh:nn:ss.fff') + '] ' + message;

    if (joolaio.options.isBrowser && console.debug) {
      if (['silly', 'debug'].indexOf(level) == -1)
        console[level](message);
      else if (joolaio.options.debug.enabled && ['silly', 'debug'].indexOf(level) > -1)
        console[level](message);
    }
    else
      console.log(message);

    if (callback)
      return callback(null);
  };

  logger.silly = function (message, callback) {
    return this._log('silly', message, callback);
  };

  logger.info = function (message, callback) {
    return this._log('info', message, callback);
  };

  logger.debug = function (message, callback) {
    return this._log('debug', message, callback);
  };

  logger.warn = function (message, callback) {
    return this._log('warn', message, callback);
  };

  logger.error = function (message, callback) {
    return this._log('error', message, callback);
  };
}