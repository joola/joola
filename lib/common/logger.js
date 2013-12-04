/**
 *  joola.io
 *
 *  Copyright Itay Weinberger, <itay@joo.la>
 *
 *  Licensed under MIT License.
 *  See LICENSE, AUTHORS.
 *
 *  @license MIT <http://spdx.org/licenses/MIT>
 **/

var
  winston = require('winston'),
  _ = require('underscore');

var logger;

var silentLogger = {
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
  warn: function () {

  },
  setLevel: function () {

  }
};

var nolog = joola.config.get('nolog');
if (!nolog && process.env.NODE_ENV != 't1est') {
  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'silly', json: false, colorize: true, timestamp: function () {
        return '[' + process.pid + '] ' + new Date().format('yyyy-mm-dd hh:nn:ss.fff');
      } })
    ],
    exitOnError: false
  });
}
else {
  logger = silentLogger;
}
//Fix bug with missing method
_.each(logger.transports, function (t) {
  t.logException = function (err) {
    logger.error(err);
  };
});

logger.setLevel = function (level) {
  _.each(logger.transports, function (t) {
    t.level = level;
  });
};

module.exports = logger;