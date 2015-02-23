/**
 *  joola
 *
 *  Copyright Itay Weinberger, <itay@joo.la>
 *
 *  Licensed under MIT License.
 *  See LICENSE, AUTHORS.
 *
 *  @license MIT <http://spdx.org/licenses/MIT>
 **/

'use strict';

var
  joola = require('../joola'),
  fs = require('fs'),
  bunyan = require('bunyan'),
  Bunyan2Loggly = require('bunyan-loggly').Bunyan2Loggly,
  bformat = require('bunyan-format'),
  formatOut = bformat({ outputMode: 'short' }),
  ringbuffer = new bunyan.RingBuffer({ limit: 10000 });

//our basic logger with stderr and ringBuffer
var logger = bunyan.createLogger({
  name: 'joola',
  serializers: bunyan.stdSerializers,
  streams: [
    {
      stream: process.stderr,
      level: "error"
    },
    {
      level: 'trace',
      type: 'raw',    // use 'raw' to get raw log record objects
      stream: ringbuffer
    }
  ]
});

logger.silly = logger.trace;

logger.getBuffer = function () {
  return ringbuffer.records;
};

//add the stdout stream
var consoleLevel = joola.config.get('store:logger:console:level') || process.env.JOOLA_CONFIG_STORE_LOGGER_CONSOLE_LEVEL || 'info';

/* istanbul ignore if */
if (process.argv.indexOf('--debug') > -1) {
  consoleLevel = 'debug';
}/* istanbul ignore if */
if (process.argv.indexOf('--trace') > -1 || process.argv.indexOf('--vverbose') > -1) {
  consoleLevel = 'trace';
}

var s = {
  stream: formatOut,
  level: consoleLevel
};
logger.addStream(s);


joola.events.once('config:done', function () {
  var loggly = joola.config.get('store:logger:loggly');
  /* istanbul ignore if */
  if (loggly) {
    var s = {
      type: 'raw',
      level: loggly.level,
      stream: new Bunyan2Loggly({
        token: loggly.token,
        subdomain: loggly.domain
      })
    };
    logger.addStream(s);
    joola.logger.info('Added loggly stream for domain [' + loggly.domain + '], with level [' + (loggly.level || 'info') + '].');
  }

  //verify we have a valid path to log file
  var logPath;
  try {
    logPath = joola.config.get('store:logger:file:path') + '/log-' + process.pid + '.log';

    fs.statSync(logPath);
    /* istanbul ignore next */
    logger.addStream({
      level: 'trace',
      type: 'rotating-file',
      path: logPath,
      period: '1d',   // daily rotation
      count: 3        // keep 3 back copies
    });
    /* istanbul ignore next */
    joola.logger.debug('File logging @ ' + logPath);
  }
  catch (ex) {
    logPath = '/var/log/joola/';
    var logFile = logPath + 'log-' + process.pid + '.log';

    try {
      /* istanbul ignore if */
      if (fs.existsSync(logPath)) {
        logger.addStream({
          level: 'trace',
          type: 'rotating-file',
          path: logFile,
          period: '1d',   // daily rotation
          count: 3        // keep 3 back copies
        });

        joola.logger.debug('File logging @ ' + logFile);
      }
      else
        joola.logger.debug('File logging disabled. Could not resolve path to log file [' + logFile + ']: ' + 'Path missing');
    }
    catch (err) {
      /* istanbul ignore next */
      joola.logger.debug('File logging disabled. Could not resolve path to log file [' + logFile + ']: ' + err.message);
    }
  }
});

module.exports = logger;