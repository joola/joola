/**
 *  @title joola.io/lib/dispatch/config
 *  @overview Provides config management as part of system settings.
 *  @description
 *
 * - [get](#get)
 * - [set](#set)
 *
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/
var
  joola = require('../joola.io'),

  router = require('../webserver/routes/index');

/**
 * @function get
 * @param {string} name holds the name of the key to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific config by key
 */
exports.get = {
  name: "/api/config/get",
  description: "I get a specific config by name`",
  inputs: ['key'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'config:get'
  },
  run: function (context, key, callback) {
    callback = callback || emptyfunc;
    if (key == '*') {
      return callback(null, {});
    }

    joola.config.get(key, function (err, value) {
      /* istanbul ignore if */
      if (err)
        return callback(err);
      /* istanbul ignore if */
      if (typeof value === 'undefined')
        return callback(new Error('Key [' + key + '] does not exist.'));

      return callback(null, value);
    });
  }
};

/**
 * @function set
 * @param {string} name holds the name of the key to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Sets a specific config by key
 */
exports.set = {
  name: "/api/config/set",
  description: "I set a new config key",
  inputs: ['key', 'val'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'config:set'
  },
  run: function (context, key, val, callback) {
    callback = callback || emptyfunc;
    joola.config.set(key, val, function (err) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      return callback(err, val);
    });
  }
};
