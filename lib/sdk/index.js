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
  async = require('async'),
  path = require('path'),
  EventEmitter2 = require('eventemitter2').EventEmitter2;

this._id = 'core';

//THE OBJECT
var joolaio = global.joolaio = exports;

//base options
joolaio.options = {
  isBrowser: false,
  debug: {
    enabled: true,
    events: {
      enabled: true,
      trace: true
    },
    functions: {
      enabled: true
    }
  }
};

//libraries
joolaio.globals = require('../common/globals');
joolaio.config = require('./common/config');
joolaio.logger = require('./common/logger');
joolaio.dispatch = require('./common/dispatch');
joolaio.common = require('../common/index');
joolaio.events = require('../common/events');
joolaio.api = require('./common/api');
joolaio.state = {};
//joolaio.stats = require('./common/stats');
joolaio.viz = require('./viz/index');

joolaio.VERSION = require('../../package.json').version;
joolaio.TOKEN = null;

require('../common/globals');

//init procedure
joolaio.init = function (options, callback) {
  joolaio.options = joolaio.common.extend(joolaio.options, options);

  if (options.TOKEN)
    joolaio.TOKEN = options.TOKEN;

  joolaio.events.emit('core.init.start');
  joolaio.logger.info('Starting joola.io client SDK, version ' + joolaio.VERSION);

  //jQuery bypass for non-browser execution
  if (!joolaio.options.isBrowser) {
    $ = function () {
      return null;
    };
    $.prototype.fn = function () {
      return null;
    };
  }
  else
  {
    var io = require('socket.io-browserify');
    joolaio.io = io;
    joolaio.io.socket = joolaio.io.connect('http://localhost:40008');
  }
  joolaio.config.init(function (err) {
    if (err)
      return callback(err);

    joolaio.dispatch.buildstub(function (err) {
      if (err)
        return callback(err);

      console.log('using token', joolaio.TOKEN);
      joolaio.dispatch.users.getByToken(joolaio.TOKEN, function (err, user) {
        if (err)
          return callback(err);

        joolaio.USER = user;
        joolaio.events.emit('core.init.finish');
        if (callback)
          return callback(null, joolaio);

      });
    });
  });

  //global function hook (for debug)
  if (joolaio.options.debug.functions.enabled)
    [joolaio].forEach(function (obj) {
      joolaio.common.hookEvents(obj, function (event) {
      });
    });

  //global event catcher (for debug)
  if (joolaio.options.debug.enabled)
    joolaio.events.onAny(function () {
      if (joolaio.options.debug.events.enabled)
        joolaio.logger.debug('Event raised: ' + this.event);
      if (joolaio.options.debug.events.enabled && joolaio.options.debug.events.trace)
        console.trace();
    });
};
