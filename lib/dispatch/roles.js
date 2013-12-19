/**
 *  @title joola.io/lib/dispatch/roles
 *  @overview Provides role management as part of user management.
 *  @description
 *  joola.io uses the concept of `roles` to bind permissions together into a groups and then assign to a user. Roles are logical
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
var
	router = require('../webserver/routes/index'),
	Proto = require('./prototypes/role');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined roles:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured roles.
 *
 * Configuration elements participating: `config:authentication:roles`.
 *
 * Events raised via `dispatch`: `roles:list-request`, `roles:list-done`
 *
 * ```js
 * joola.dispatch.roles.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
	name: "/api/roles/list",
	description: "I list all available roles",
	inputs: [],
	_outputExample: {},
	_permission: ['manage_system'],
	dispatch: function () {
		var self = this;
		joola.dispatch.on('roles:list-request', function () {
			joola.logger.debug('Listing roles.');
			self.run(function (err, value) {
				if (err)
					return joola.dispatch.emit('roles:list-done', {err: err});

				joola.dispatch.emit('roles:list-done', {err: null, message: value});
			});
		});
	},
	route: function (req, res) {
		joola.dispatch.emitWait('roles:list-request', {}, function (err, users) {

			if (err) {
				return router.responseError(new router.ErrorTemplate('Failed to list roles: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
			}

			return router.responseSuccess(users, req, res);
		});
	},
	run: function (callback) {
		callback = callback || emptyfunc;
		joola.config.get('authentication:roles', function (err, value) {
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
 * @param {string} name holds the name of the role to get.
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 * - `name` of the role
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested username.
 *
 * Configuration elements participating: `config:authentication:roles`.
 *
 * Events raised via `dispatch`: `roles:get-request`, `roles:get-done`
 *
 * ```js
 * joola.dispatch.roles.get('test-role', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
	name: "/api/roles/get",
	description: "I get a specific role by name`",
	inputs: ['name'],
	_outputExample: {},
	_permission: ['manage_system'],
	dispatch: function () {
		var self = this;
		joola.dispatch.on('roles:get-request', function (channel, name) {
			joola.logger.debug('Getting role.');
			self.run(name, function (err, value) {
				if (err)
					return joola.dispatch.emit('roles:get-done', {err: err});

				joola.dispatch.emit('roles:get-done', {err: null, message: value});
			});
		});
	},
	route: function (req, res) {
		joola.dispatch.emitWait('roles:get-request', req.params.username, function (err, role) {
			if (err)
				return router.responseError(new router.ErrorTemplate('Failed to get role: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

			return router.responseSuccess(role, req, res);
		});
	},
	run: function (rolename, callback) {
		callback = callback || emptyfunc;
		joola.config.get('authentication:roles:' + rolename, function (err, value) {
			if (err)
				return callback(err);

			if (typeof value === 'undefined')
				return callback(new Error('Role [' + rolename + '] does not exist.'));

			return callback(null, value);
		});
	}
};

/**
 * @function add
 * @param {Object} options describes the new role
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `name` of the new role
 * - `permissions` included as part of this role.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added role.
 *
 * Configuration elements participating: `config:authentication:roles`.
 *
 * Events raised via `dispatch`: `roles:add-request`, `roles:add-done`
 *
 * ```js
 * var options = {
 *   name: 'test-role',
 *   permissions: ['access_system']
 * };
 *
 * joola.dispatch.roles.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
	name: "/api/roles/add",
	description: "I add a new user",
	inputs: ['role'],
	_outputExample: {},
	_permission: ['manage_system'],
	dispatch: function () {
		var self = this;
		joola.dispatch.on('roles:add-request', function (channel, role) {
			joola.logger.debug('New role request [' + role.name + ']');
			self.run(role, function (err, value) {
				if (err)
					return joola.dispatch.emit('roles:add-done', {err: err});

				joola.dispatch.emit('roles:add-done', {err: null, message: value});
			});
		});
	},
	route: function (req, res) {
		try {
			var role = {
				name: req.params.role.name,
				permissions: req.params.role.permissions
			};

			joola.dispatch.emitWait('roles:add-request', role, function (err, _user) {
				if (err)
					return router.responseError(new router.ErrorTemplate('Failed to add new role: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
				return router.responseSuccess(_user, req, res);
			});
		}
		catch (err) {
			return router.responseError(new router.ErrorTemplate(err), req, res);
		}
	},
	run: function (role, callback) {
		callback = callback || emptyfunc;

		try {
			role = new Proto(role);
		} catch (ex) {
			return callback(ex);
		}
		joola.config.get('authentication:roles', function (err, value) {
			if (err)
				return callback(err);

			var _roles;
			if (!value)
				_roles = {};
			else
				_roles = value;

			if (_roles[role.name])
				return callback(new Error('A role with name [' + role.name + '] already exists.'));

			_roles[role.name] = role;
			joola.config.set('authentication:roles', _roles, function (err) {
				if (err)
					return callback(err);

				return callback(err, role);
			});
		});
	}
};

/**
 * @function update
 * @param {Object} options describes the role to update and the new details
 * @param {Function} [callback] called following execution with errors and results.
 * Updates an existing user described in `options`:
 * - `name` name of the role (cannot be updated).
 * - `permissions` permissions to be included as part of the role
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the updated role.
 *
 * Configuration elements participating: `config:authentication:roles`.
 *
 * Events raised via `dispatch`: `roles:update-request`, `roles:update-done`
 *
 * ```js
 * var options = {
 *   name: 'test-role',
 *   permissions: ['access_system']
 * };
 *
 * joola.dispatch.roles.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.update = {
	name: "/api/roles/update",
	description: "I update an existing role",
	inputs: ['role'],
	_outputExample: {},
	_permission: ['manage_system'],
	dispatch: function () {
		var self = this;
		joola.dispatch.on('roles:update-request', function (channel, role) {
			joola.logger.debug('Update role request [' + role.name + ']');
			self.run(role, function (err, value) {
				if (err)
					return joola.dispatch.emit('roles:update-done', {err: err});

				joola.dispatch.emit('roles:update-done', {err: null, message: value});
			});
		});
	},
	route: function (req, res) {
		try {
			var role = {
				name: req.params.role.name,
				permissions: req.params.role.permissions
			};

			joola.dispatch.emitWait('roles:update-request', role, function (err, role) {
				if (err)
					return router.responseError(new router.ErrorTemplate('Failed to update role: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
				return router.responseSuccess(role, req, res);
			});
		}
		catch (err) {
			return router.responseError(new router.ErrorTemplate(err), req, res);
		}
	},
	run: function (role, callback) {
		callback = callback || emptyfunc;

		try {
			role = new Proto(role);
		} catch (ex) {
			return callback(ex);
		}

		joola.config.get('authentication:roles', function (err, value) {
			if (err)
				return callback(err);

			var _roles;
			if (!value)
				_roles = {};
			else
				_roles = value;

			if (!_roles.hasOwnProperty(role.name))
				return callback(new Error('Role with name [' + role.name + '] does not exist.'));
			_roles[role.name] = role;
			joola.config.set('authentication:roles', _roles, function (err) {
				if (err)
					return callback(err);

				return callback(err, role);
			});
		});
	}
};

/**
 * @function delete
 * @param {Object} options describes the role to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes a role described in `options`:
 * - `name` of the role to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted role.
 *
 * Configuration elements participating: `config:authentication:roles`.
 *
 * Events raised via `dispatch`: `roles:delete-request`, `roles:delete-done`
 *
 * ```js
 * var options = {
 *   name: 'test-role'
 * };
 *
 * joola.dispatch.roles.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
	name: "/api/roles/delete",
	description: "I delete an existing role",
	inputs: ['role'],
	_outputExample: {},
	_permission: ['manage_system'],
	dispatch: function () {
		var self = this;
		joola.dispatch.on('roles:delete-request', function (channel, role) {
			joola.logger.debug('Role delete request [' + role.name + ']');
			self.run(role, function (err, value) {
				if (err)
					return joola.dispatch.emit('roles:delete-done', {err: err});

				joola.dispatch.emit('roles:delete-done', {err: null, message: value});
			});
		});
	},
	route: function (req, res) {
		try {
			var role = req.params.role;

			joola.dispatch.emitWait('roles:delete-request', role, function (err, _role) {
				if (err)
					return router.responseError(new router.ErrorTemplate('Failed to delete role: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
				return router.responseSuccess(_role, req, res);
			});
		}
		catch (err) {
			return router.responseError(new router.ErrorTemplate(err), req, res);
		}
	},
	run: function (role, callback) {
		callback = callback || emptyfunc;

		exports.get.run(role.name, function (err, value) {
			if (err)
				return callback(err);

			joola.config.clear('authentication:roles:' + role.name, function (err) {
				if (err)
					return callback(err);

				joola.config.get('authentication:roles:' + role.name, function (err, value) {
					if (err)
						return callback(err);
					if (!value || !value.hasOwnProperty('name'))
						return callback(null, role);

					return callback(new Error('Failed to delete role [' + role.name + '].'));
				});
			});
		});
	}
};