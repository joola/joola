/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

var
  path = require('path'),
  uuid = require('node-uuid'),
  nconf = require('nconf'),

  Dispatch = require('./lib/dispatch');

require('./lib/common/globals');

//our base global object
var joola = {};
global.joola = module.exports = joola;
joola.VERSION = require('./package.json').version;
joola.UID = uuid.v4();

//setup the process domain, to handle unhandled exceptions
require('./lib/common/domain');

//setup the stack
joola.common = require('./lib/common/index');
joola.state = require('./lib/common/state');
joola.config = require('./lib/common/config')({});
joola.logger = require('./lib/common/logger');
joola.events = require('./lib/common/events');
joola.dispatch = new Dispatch({});

joola.sdk = require('./lib/sdk');

joola.redis = joola.config.stores.redis.redis;
joola.stats = null; //require('./lib/common/stats');

//setup the main watchers for system health
require('./lib/common/watchers');

//setup REPL for remote management
// we have a special file that contains a set of global functions designed to be used by REPL.
// NOTE: this option should be only used for debug/development and can be used as a back-door.
if (joola.config.get('repl'))
  require('./lib/common/repl');

//load command line and env variables needed for startup.
var cli = require('./lib/common/cli');
if (cli.process()) {
  //the user's args included some terminating ones, such as: version, help
  process.exit(0);
}

//we're live
joola.logger.info('joola.io version ' + joola.VERSION + ' started.');
