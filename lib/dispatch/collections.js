/**
 *  @title joola.io/lib/dispatch/collections
 *  @overview Provides organization management as part of user management.
 *  @description
 *  joola.io uses the concept of `organization` to bind users together into a groups. collections are logical business
 *  entities and provide the developer/user with the ability to manage permissions and filters, based not only on users
 *  and roles, but also on an organization level.
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
var
  router = require('../webserver/routes/index'),
  Proto = require('./prototypes/organization');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined collections:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured collections.
 *
 * Configuration elements participating: `config:authentication:collections`.
 *
 * Events raised via `dispatch`: `orgs:list-request`, `orgs:list-done`
 *
 * ```js
 * joola.dispatch.collections.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/api/collections/list",
  description: "I list all available collections",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:list'
  },
  run: function (callback) {
    callback = callback || emptyfunc;
    joola.config.get('authentication:collections', function (err, value) {
      if (err) {
        return callback(err);
      }

      if (typeof value === 'undefined')
        value = {};

      return callback(null, value);
    });
  }
};

/**
 * @function get
 * @param {string} name holds the name of the organization to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `name` of the organization
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested username.
 *
 * Configuration elements participating: `config:authentication:collections`.
 *
 * Events raised via `dispatch`: `orgs:get-request`, `orgs:get-done`
 *
 * ```js
 * joola.dispatch.collections.get('test-org', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/api/collections/get",
  description: "I get a specific organization by name`",
  inputs: ['name'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:get'
  },
  run: function (orgname, callback) {
    callback = callback || emptyfunc;
    joola.config.get('authentication:collections:' + orgname, function (err, value) {
      if (err)
        return callback(err);

      if (typeof value === 'undefined')
        return callback(new Error('Organization [' + orgname + '] does not exist.'));

      return callback(null, value);
    });
  }
};

/**
 * @function add
 * @param {Object} options describes the new organization
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `name` of the new organization
 * - `filter` to apply on organization members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added organization.
 *
 * Configuration elements participating: `config:authentication:collections`.
 *
 * Events raised via `dispatch`: `orgs:add-request`, `orgs:add-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org',
 *   filter: 'Country=France'
 * };
 *
 * joola.dispatch.collections.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/api/collections/add",
  description: "I add a new user",
  inputs: ['org'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:add'
  },
  run: function (org, callback) {
    callback = callback || emptyfunc;
    try {
      org = new Proto(org);
    } catch (ex) {
      return callback(ex);
    }
    joola.config.get('authentication:collections', function (err, value) {
      if (err)
        return callback(err);

      var _orgs;
      if (!value)
        _orgs = {};
      else
        _orgs = value;

      if (_orgs[org.name])
        return callback(new Error('An organization with name [' + org.name + '] already exists.'));

      _orgs[org.name] = org;
      joola.config.set('authentication:collections', _orgs, function (err) {
        if (err)
          return callback(err);

        return callback(err, org);
      });
    });
  }
};

/**
 * @function update
 * @param {Object} options describes the organization to update and the new details
 * @param {Function} [callback] called following execution with errors and results.
 * Updates an existing user described in `options`:
 * - `name` name of the organization (cannot be updated).
 * - `_filter` filter to be applied on organization's members.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated organization.
 *
 * Configuration elements participating: `config:authentication:collections`.
 *
 * Events raised via `dispatch`: `orgs:update-request`, `orgs:update-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org',
 *   _filter: 'Country=France'
 * };
 *
 * joola.dispatch.collections.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.update = {
  name: "/api/collections/update",
  description: "I update an existing organization",
  inputs: ['org'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:update'
  },
  run: function (org, callback) {
    callback = callback || emptyfunc;

    try {
      org = new Proto(org);
    } catch (ex) {
      return callback(ex);
    }

    joola.config.get('authentication:collections', function (err, value) {
      if (err)
        return callback(err);

      var _orgs;
      if (!value)
        _orgs = {};
      else
        _orgs = value;

      if (!_orgs.hasOwnProperty(org.name))
        return callback(new Error('Organization with name [' + org.name + '] does not exist.'));
      _orgs[org.name] = org;
      joola.config.set('authentication:collections', _orgs, function (err) {
        if (err)
          return callback(err);

        return callback(err, org);
      });
    });
  }
};

/**
 * @function delete
 * @param {Object} options describes the organization to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes an organization described in `options`:
 * - `name` of the organization to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted organization.
 *
 * Configuration elements participating: `config:authentication:collections`.
 *
 * Events raised via `dispatch`: `orgs:delete-request`, `orgs:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org'
 * };
 *
 * joola.dispatch.collections.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/api/collections/delete",
  description: "I delete an existing organization",
  inputs: ['org'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'collections:delete'
  },
  run: function (org, callback) {
    callback = callback || emptyfunc;

    exports.get.run(org.name, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('authentication:collections:' + org.name, function (err) {
        if (err)
          return callback(err);

        joola.config.get('authentication:collections:' + org.name, function (err, value) {
          if (err)
            return callback(err);
          if (!value || !value.hasOwnProperty('name'))
            return callback(null, org);

          return callback(new Error('Failed to delete organization [' + org.name + '].'));
        });
      });
    });
  }
};