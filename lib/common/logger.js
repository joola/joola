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
  bunyan = require('bunyan'),
  bformat = require('bunyan-format'),
  formatOut = bformat({ outputMode: 'short' }),
  ringbuffer = new bunyan.RingBuffer({ limit: 100 });

if (!global.nolog) {
  joola.events.on('config:done', function () {
    //verify we have a valid path to log file
    var logPath;
    try {
      logPath = joola.config.store.logger.file.path + '/log-' + process.pid + '.log';

      logger.addStream({
        type: 'rotating-file',
        path: logPath,
        period: '1d',   // daily rotation
        count: 3        // keep 3 back copies
      });
    }
    catch (ex) {
      try {
        logPath = '/var/log/joola.io/log-' + process.pid + '.log';

        logger.addStream({
          type: 'rotating-file',
          path: logPath,
          period: '1d',   // daily rotation
          count: 3        // keep 3 back copies
        });
      }
      catch (err) {
        throw new Error('Could not resolve path to log file [' + '/var/log/joola.io/log-' + process.pid + '.log' + ']: ' + err.message);
      }
    }

    try {
      var mongo_options = {
        safe: true,
        host: joola.config.store.logger.mongo.host,
        port: joola.config.store.logger.mongo.port,
        user: joola.config.store.logger.mongo.user,
        password: joola.config.store.logger.mongo.password,
        db: joola.config.store.logger.mongo.db
      };

      //verify that we have a valid mongo for logging
      var
        mongoCol = require('mongo-col'),
        mongoStream = require('mongo-stream'),
        mongoInsertStream = mongoStream(mongoCol('events', 'joolaio_logger', {
          dbOptions: mongo_options
        }));

      logger.addStream(
        {
          level: 'debug',
          type: 'raw',
          stream: mongoInsertStream.insert({
            safe: true
          })
        });
    }
    catch (ex) {
      throw new Error('Failed to setup mongo logger options: ' + ex);
    }
  });
}

var logger = bunyan.createLogger({
  name: 'joola.io',
  serializers: bunyan.stdSerializers,
  streams: [
    {
      stream: formatOut,
      level: "trace"
    },
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

module.exports = logger;