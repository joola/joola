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

var lastLog = new Date();
var logger;

var nolog = joola.config.get('nolog');
if (!nolog && process.env.NODE_ENV != 'test') {
  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'debug', json: false, colorize: true, timestamp: function () {
        var tsStart = new Date();
        try {

          if (joola)
            tsStart = joola.timestamps.start.getTime();
        }
        catch (ex) {
        }
        var output = '[' + process.pid + '] ' + new Date().format('yyyy-mm-dd hh:nn:ss') + ', ' + (new Date().getTime() - lastLog.getTime()) + ' ms';
        lastLog = new Date();
        return output;
      } })
    ],
    exitOnError: false
  });
}
else {
  logger = {
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

    }};
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