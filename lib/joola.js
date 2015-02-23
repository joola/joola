'use strict';

//our base global object
var joola = {};
module.exports = joola;
joola.VERSION = require('./../package.json').version;
joola.sdk = require('joola.sdk');

joola.init = function (options, callback) {
  /* istanbul ignore if */
  if (typeof callback !== 'function')
    callback = function () {
    };


  //setup the process domain, to handle unhandled exceptions
  require('./common/domain');

  //setup the stack
  joola.common = require('./common/index');
  joola.options = joola.common.extend({
    webserver: false,
    logger: {
      console: {
        level: 'info'
      }
    }
  }, options);

  //load command line and env variables needed for startup.
  var cli = require('./common/cli');
  /* istanbul ignore if */
  if (cli.process()) {
    //the user's args included some terminating ones, such as: version, help
    process.exit(0);
  }

  joola.common.geoip = require('./common/geoip');
  joola.events = require('./common/events');
  joola.config = require('./discovery');
  joola.state = require('./common/state');
  joola.dispatch = require('./dispatch');
  joola.redis = null;
  joola.logger = require('./common/logger');

  joola.auth = require('./common/auth');
  joola.datastore = require('./common/datastore');

  joola.webserver = require('./webserver');
  joola.memory = require('./common/memory');
  joola.etl = require('./dispatch/beacon').etl;

  joola.SYSTEM_USER = {
    username: '_system',
    workspace: '_system',
    password: null,
    roles: [],
    permissions: ['superuser']
  };
  joola.STATS_USER = {
    username: 'internal_stats',
    workspace: '_stats',
    password: null,
    roles: ['beacon'],
    permissions: ['beacon:insert']
  };

  joola.UID = joola.common.uuid();

  //setup the main watchers for system management and health
  require('./common/watchers');

  //add global functions
  require('./common/globals');

  //bring the stack online
  joola.config.init(function (err) {
    /* istanbul ignore if */
    if (err) {
      console.log('Error starting application. This error occurred while trying to initalize the framework.'.red);
      console.log('Exception details:'.red);
      console.log(err);
      process.exit();
    }
    joola.stats = require('./common/stats');
    var redisConfig = joola.config.get('store:runtime:redis');
    /* istanbul ignore if */
    if (redisConfig && redisConfig.dsn) {
      if (!joola.redis)
        joola.redis = require('./common/redis')(joola.config.get('store:runtime:redis'));
    }
    joola.dispatch.init(function (err) {
      /* istanbul ignore if */
      if (err) {
        console.log('Error starting application. This error occurred while trying to initalize the dispatch sub-system.'.red);
        console.log('Exception details:'.red);
        console.log(err);
        process.exit();
      }
      joola.logger.debug('Message dispatch online.');

      joola.datastore.init(function (err) {
        /* istanbul ignore if */
        if (err) {
          console.log('Error starting application. This error occurred while trying to initalize the datastore sub-system.'.red);
          console.log('Exception details:'.red);
          console.log(err);
          process.exit();
        }

        joola.logger.debug('Datastore online.');
        joola.events.emit('datastore:ready');

        joola.webserver.start({}, function (err, http) {
          /* istanbul ignore if */
          if (err) {
            joola.logger.error('Webserver startup reported an issue, exiting: ' + (typeof(err) === 'object' ? err.message : err));
            callback(new Error('Webserver startup reported an issue, exiting: ' + (typeof(err) === 'object' ? err.message : err)));
            return joola.shutdown(1);
          }

          if (joola.config.get('webserver')) {
            setTimeout(function () {
              joola.logger.debug('Verifying webserver(s)');
              joola.webserver.verify(function (err) {
                /* istanbul ignore if */
                if (err) {
                  joola.logger.error('Failed to validate webserver(s) are online.');
                  callback(new Error('Failed to validate webserver(s) are online.'));
                  return joola.shutdown(1);
                }
                else {
                  //webserver is live (if it should be)

                  //we're live
                  joola.logger.info('joola version ' + joola.VERSION + ' started [' + joola.UID + '].');

                  joola.logger.debug('Webserver(s) verified.');
                  joola.events.emit('init:done', joola);
                  return callback(null, joola);
                }
              });
            }, 2000);
          }
          else {
            //webserver is live (if it should be)
            //we're live
            joola.logger.info('joola version ' + joola.VERSION + ' started [' + joola.UID + '].');

            joola.events.emit('init:done', joola);
            return callback(null, joola);
          }
        });
      });
    });

    //setup REPL for remote management
    // we have a special file that contains a set of global functions designed to be used by REPL.
    // NOTE: this option should be only used for debug/development and can be used as a back-door.
    /* istanbul ignore if */
    if (process.argv.indexOf('--repl') > -1)
      require('./common/repl');

  });

  //This will be fired when the init part is done.
  joola.events.on('init:done', function () {
    //let's check the state of the cache and if we need to build it.
    joola.state.set('core', 'online', 'system online!');
  });

  //This will respond to any global state changes (i.e. system online, offline)
  joola.state.on('state:change', function (state) {

  });

  var lastRead = -1;
  setInterval(function () {
    if (!joola.statistics)
      return;
    if (lastRead === -1)
      lastRead = joola.statistics.total;
    joola.statistics.eps = joola.statistics.total - lastRead;
    lastRead = joola.statistics.total;
    //joola.logger.debug('EPS: ' + joola.statistics.eps + ', Current: ' + joola.statistics.current + ', Total: ' + joola.statistics.total);
  }, 1000);
};

