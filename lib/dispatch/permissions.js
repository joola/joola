/**
 *  @title joola/lib/dispatch/permissions
 *  @overview Provides permission management as part of user management.
 *  @description
 *  joola uses the concept of `permissions` to bind permissions together into a groups and then assign to a user. permissions are logical
 *  entities and provide the developer/user with the ability to manage permissions in a granular fashion while allowing overlap.
 *
 * - [list](#list)
 * - [get](#get)
 * - [add](#add)
 * - [update](#update)
 * - [delete](#delete)
 *
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/

'use strict';

var
  joola = require('../joola'),

  router = require('../webserver/routes/index');
  //Proto = require('./prototypes/permission');


var permissions = ['access_system', 'manage_system', 'beacon_insert', 'query'];

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined permissions:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured permissions.
 *
 * Configuration elements participating: `config:authentication:permissions`.
 *
 * Events raised via `dispatch`: `permissions:list-request`, `permissions:list-done`
 *
 * ```js
 * joola.dispatch.permissions.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/permissions/list",
  description: "I list all available permissions",
  inputs: [],
  _outputExample: {},
  _permission: ['permissions:list'],
  _dispatch: {
    message: 'permissions:list'
  },
  run: function (context, callback) {
    callback = callback || function () {
    };
    return callback(null, permissions);
  }
};

/**
 * @function get
 * @param {string} name holds the name of the permission to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `name` of the permission
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested username.
 *
 * Configuration elements participating: `config:authentication:permissions`.
 *
 * Events raised via `dispatch`: `permissions:get-request`, `permissions:get-done`
 *
 * ```js
 * joola.dispatch.permissions.get('test-permission', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/permissions/get",
  description: "I get a specific permission by name`",
  inputs: ['name'],
  _outputExample: {},
  _permission: ['permissions:get'],
  _dispatch: {
    message: 'permissions:get'
  },
  run: function (context, permissionname, callback) {
    callback = callback || function () {
    };
    if (permissions.indexOf(permissionname) === -1)
      return callback(new Error('Permission [' + permissionname + '] does not exist.'));
    return callback(null, [permissionname]);
  }
};