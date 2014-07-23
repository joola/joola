/**
 *  @title joola/lib/dispatch/config
 *  @overview Provides config management as part of system settings.
 *  @description
 *
 * - [get](#get)
 * - [set](#set)
 *
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/

'use strict';

var
  joola = require('../joola'),

  router = require('../webserver/routes/index');

/**
 * @function get
 * @param {string} name holds the name of the key to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific config by key
 */
exports.get = {
  name: "/config/get",
  description: "I get a specific config by name`",
  inputs: ['key'],
  _outputExample: {},
  _permission: ['config:get'],
  _dispatch: {
    message: 'config:get'
  },
  run: function (context, key, callback) {
    callback = callback || function () {
    };

    if (key === '*')
      return callback(null, joola.config._config);

    joola.config.get(key, function (err, value) {
      /* istanbul ignore if */
      if (err)
        return callback(err);
      /* istanbul ignore if */
      if (typeof value === 'undefined' || value === null)
        return callback(new Error('Key [' + key + '] does not exist.'));

      return callback(null, {key: key, value: value});
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
  name: "/config/set",
  description: "I set a new config key",
  inputs: ['key', 'val'],
  _outputExample: {},
  _permission: ['config:set'],
  _dispatch: {
    message: 'config:set'
  },
  run: function (context, key, val, callback) {
    callback = callback || function () {
    };

    if (typeof val === 'object')
      val = val.value;

    if (key === '*' && typeof val === 'object') {
      return joola.config.storePopulate(val, callback);
    }

    joola.config.set(key, val, function (err) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      return callback(null, {key: key, value: val});
    });
  }
};
