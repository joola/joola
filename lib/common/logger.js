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

'use strict';

var
  joola = require('../joola.io'),
  fs = require('fs'),
  mongo_url_parser = require('mongodb/lib/mongodb/connection/url_parser'),
  bunyan = require('bunyan'),
  Bunyan2Loggly = require('bunyan-loggly').Bunyan2Loggly,
  bformat = require('bunyan-format'),
  formatOut = bformat({ outputMode: 'short' }),
  ringbuffer = new bunyan.RingBuffer({ limit: 10000 });

//our basic logger with stderr and ringBuffer
var logger = bunyan.createLogger({
  name: 'joola.io',
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
var consoleLevel = joola.config.get('store:logger:console:level') || (process.env.NODE_ENV === 'test' ? 'trace' : null) || 'trace';

if (process.argv.indexOf('--debug') > -1) {
  consoleLevel = 'debug';
}
if (process.argv.indexOf('--trace') > -1 || process.argv.indexOf('--vverbose') > -1) {
  consoleLevel = 'trace';
}

var s = {
  stream: formatOut,
  level: consoleLevel
};
logger.addStream(s);


var logglyToken = process.env.JOOLAIO_CONFIG_STORE_LOGGER_LOGGLY_TOKEN;
var logglyDomain = process.env.JOOLAIO_CONFIG_STORE_LOGGER_LOGGLY_DOMAIN;
var logglyLevel = process.env.JOOLAIO_CONFIG_STORE_LOGGER_LOGGLY_LEVEL || 'info';
var logglyDefined = false;
if (logglyToken && logglyDomain) {
  s = {
    type: 'raw',
    level: logglyLevel,
    stream: new Bunyan2Loggly({
      token: logglyToken,
      subdomain: logglyDomain
    })
  };
  logger.addStream(s);
  logglyDefined = true;
}

/* istanbul ignore if */
/* istanbul ignore else */
joola.events.once('config:done', function () {
  var loggly = joola.config.get('store:logger:loggly');
  if (loggly && !logglyDefined) {
    s = {
      type: 'raw',
      level: loggly.level || 'info',
      stream: new Bunyan2Loggly({
        token: loggly.token,
        subdomain: loggly.domain
      })
    };
    logger.addStream(s);
    console.log(s);
  }

  //verify we have a valid path to log file
  var logPath;
  try {
    logPath = joola.config.get('store:logger:file:path') + '/log-' + process.pid + '.log';

    fs.statSync(logPath);

    logger.addStream({
      level: 'trace',
      type: 'rotating-file',
      path: logPath,
      period: '1d',   // daily rotation
      count: 3        // keep 3 back copies
    });

    joola.logger.debug('File logging @ ' + logPath);
  }
  catch (ex) {
    logPath = '/var/log/joola.io/';
    var logFile = logPath + 'log-' + process.pid + '.log';

    try {
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
        joola.logger.warn('File logging disabled. Could not resolve path to log file [' + logFile + ']: ' + 'Path missing');
    }
    catch (err) {
      joola.logger.warn('File logging disabled. Could not resolve path to log file [' + logFile + ']: ' + err.message);
    }
  }

  try {
    var mongo_options = {
      dbOptions: {safe: false}
    };
    var dsn = joola.config.get('store:logger:mongo:dsn');
    if (dsn) {
      var parts = mongo_url_parser.parse(dsn);
      mongo_options.host = parts.servers[0].host;
      mongo_options.port = parts.servers[0].port;
      mongo_options.user = parts.auth ? parts.auth.user : null;
      mongo_options.password = parts.auth ? parts.auth.password : null;
      mongo_options.db = parts.dbName;
    }
    else {
      mongo_options.host = joola.config.get('store:logger:mongo:host');
      mongo_options.port = joola.config.get('store:logger:mongo:port');
      mongo_options.user = joola.config.get('store:logger:mongo:user');
      mongo_options.password = joola.config.get('store:logger:mongo:password');
      mongo_options.db = joola.config.get('store:logger:mongo:db');
    }
    //verify that we have a valid mongo for logging
    var
      mongoCol = require('mongo-col'),
      mongoStream = require('mongo-stream')(mongoCol('events', 'logger', mongo_options));
    var mongoLoggerStopped = false;
    var d = require('domain').create();
    d.add(mongoCol);
    d.add(mongoStream);
    d.on('error', function (err) {
      if (!mongoLoggerStopped) {
        mongoLoggerStopped = true;
        logger.streams.forEach(function (s, i) {
          if (s.mongo)
            logger.streams.splice(i, 1);
        });
        joola.logger.warn('[logger] Failed to write to mongo: ' + err);
      }
    });
    d.run(function () {
      logger.addStream(
        {
          level: 'debug',
          type: 'raw',
          mongo: true,
          stream: mongoStream.insert({
            safe: true
          })
        });
    });

  }
  catch (ex) {
    //throw new Error('Failed to setup mongo logger options: ' + ex);
  }
});

module.exports = logger;