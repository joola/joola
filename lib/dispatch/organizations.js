/**
 *  @title joola.io/lib/dispatch/organizations
 *  @overview Provides organization management as part of user management.
 *  @description
 *  joola.io uses the concept of `organization` to bind users together into a groups. Organizations are logical business
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
 * Lists all defined organizations:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured organizations.
 *
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:list-request`, `orgs:list-done`
 *
 * ```js
 * joola.dispatch.organizations.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
  name: "/api/organizations/list",
  description: "I list all available organizations",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'organizations:list'
  },
  run: function (context, callback) {
    callback = callback || emptyfunc;
    joola.config.get('authentication:organizations', function (err, value) {
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
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:get-request`, `orgs:get-done`
 *
 * ```js
 * joola.dispatch.organizations.get('test-org', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
  name: "/api/organizations/get",
  description: "I get a specific organization by name`",
  inputs: ['name'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'organizations:get'
  },
  run: function (context, orgname, callback) {
    callback = callback || emptyfunc;
    joola.config.get('authentication:organizations:' + orgname, function (err, value) {
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
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:add-request`, `orgs:add-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org',
 *   filter: 'Country=France'
 * };
 *
 * joola.dispatch.organizations.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
  name: "/api/organizations/add",
  description: "I add a new user",
  inputs: ['org'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'organizations:add'
  },
  run: function (context, org, callback) {
    callback = callback || emptyfunc;
    try {
      org = new Proto(org);
    } catch (ex) {
      return callback(ex);
    }
    exports.get.run(context, org.id, function (err) {
      if (!err)
        return callback(new Error('Organization already exists'));

      joola.config.set('authentication:organizations:' + org.id, org, function (err) {
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
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:update-request`, `orgs:update-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org',
 *   _filter: 'Country=France'
 * };
 *
 * joola.dispatch.organizations.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.update = {
  name: "/api/organizations/update",
  description: "I update an existing organization",
  inputs: ['org'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'organizations:update'
  },
  run: function (context, org, callback) {
    callback = callback || emptyfunc;

    try {
      org = new Proto(org);
    } catch (ex) {
      return callback(ex);
    }

    exports.get.run(context, org.id, function (err) {
      if (err)
        return callback(err);

      joola.config.set('authentication:organizations:' + org.id, org, function (err) {
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
 * Configuration elements participating: `config:authentication:organizations`.
 *
 * Events raised via `dispatch`: `orgs:delete-request`, `orgs:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-org'
 * };
 *
 * joola.dispatch.organizations.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
  name: "/api/organizations/delete",
  description: "I delete an existing organization",
  inputs: ['org'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'organizations:delete'
  },
  run: function (context, org, callback) {
    callback = callback || emptyfunc;

    exports.get.run(context, org.id, function (err, value) {
      if (err)
        return callback(err);

      joola.config.clear('authentication:organizations:' + org.id, function (err) {
        if (err)
          return callback(err);

        joola.config.get('authentication:organizations:' + org.id, function (err, value) {
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