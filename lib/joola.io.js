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
  uuid = require('node-uuid');

//Dispatch = require('./lib/dispatch');

require('./common/globals');

//our base global object
var joola = {};
global.joola = module.exports = joola;
joola.VERSION = require('./../package.json').version;
joola.UID = uuid.v4();

//load command line and env variables needed for startup.
var cli = require('./common/cli');
if (cli.process()) {
  //the user's args included some terminating ones, such as: version, help
  process.exit(0);
}

//setup the process domain, to handle unhandled exceptions
require('./common/domain');

//setup the stack
joola.common = require('./common/index');
joola.events = require('./common/events');
joola.config = require('./common/config');
joola.state = require('./common/state');
joola.dispatch = require('./dispatch');
joola.redis = require('./common/redis')({});
joola.logger = require('./common/logger');
joola.sdk = require('./sdk');
joola.webserver = require('./webserver');
joola.stats = null; //require('./lib/common/stats');

//we're live
joola.logger.info('joola.io version ' + joola.VERSION + ' started.');

//setup the main watchers for system management and health
require('./common/watchers');

//bring the stack online
joola.config.init(function (err) {
  if (err)
    throw err;

  joola.dispatch.init(function (err) {
    if (err)
      throw err;

    joola.dispatch.hook();
    joola.webserver.start({}, function (err) {
      if (err) {
        joola.logger.error('Webserver startup reported an issue, exiting: ' + err);
        return shutdown(1);
      }

      if (joola.config.get('webserver')) {
        setTimeout(function () {
          joola.logger.debug('Verifying webserver(s)');
          if (joola.state.controls['webserver-http'].state != 'working' ||
            (joola.state.controls['webserver-https'] && joola.state.controls['webserver-https'].state != 'working')) {
            joola.logger.error('Failed to validate webserver(s) are online.');
            return shutdown(1);
          }
          else
            joola.logger.debug('Webserver(s) verified.');
        }, 3000);
      }

      //webserver is live (if it should be)

    });
  });

  //setup REPL for remote management
  // we have a special file that contains a set of global functions designed to be used by REPL.
  // NOTE: this option should be only used for debug/development and can be used as a back-door.
  if (joola.config.get('repl'))
    require('./common/repl');

  joola.events.emit('init:done', 1);

});
