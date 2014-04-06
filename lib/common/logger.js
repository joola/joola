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
  joola = require('../joola.io'),
  fs = require('fs'),
  bunyan = require('bunyan'),
  bformat = require('bunyan-format'),
  formatOut = bformat({ outputMode: 'short' }),
  ringbuffer = new bunyan.RingBuffer({ limit: 10000 });

/* istanbul ignore if */
/* istanbul ignore else */
if (!global.nolog) {
  joola.events.once('config:done', function () {
    //verify we have a valid path to log file
    var logPath;
    try {
      logPath = joola.config.store.logger.file.path + '/log-' + process.pid + '.log';

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

    /*
     try {
     var mongo_options = {
     dbOptions: {safe: false},
     host: joola.config.store.logger.mongo.host,
     port: joola.config.store.logger.mongo.port,
     user: joola.config.store.logger.mongo.user,
     password: joola.config.store.logger.mongo.password,
     db: joola.config.store.logger.mongo.db
     };

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
     */
  });

  var logger = bunyan.createLogger({
    name: 'joola.io',
    serializers: bunyan.stdSerializers,
    streams: [
      {
        stream: formatOut,
        level: joola.config.get('logger:console:level') || 'info'
      },
      {
        stream: process.stderr,
        level: "error"
      },
      {
        level: 'trace',
        //type: 'raw',    // use 'raw' to get raw log record objects
        stream: ringbuffer
      }
    ]
  });
}
else {
  var logger = bunyan.createLogger({
    name: 'joola.io',
    serializers: bunyan.stdSerializers,
    streams: [
      {
        level: 'debug',
        //type: 'raw',    // use 'raw' to get raw log record objects
        stream: ringbuffer
      }
    ]
  });
}
logger.silly = logger.trace;

logger.getBuffer = function () {
  return ringbuffer.records;
};

module.exports = logger;