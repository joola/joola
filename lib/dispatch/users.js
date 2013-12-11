/**
 *  @title joola.io/lib/dispatch/users
 *  @overview Provides user management functionality across the framework.
 *  @description
 *  The `users` dispatch manages the entire flow relating to users, for example: listing or adding a user.
 *  The module follows the guidelines and flow defined in [Disptach Flow](dispatch-flow).
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
	proto = require('./prototypes/user');

/**
 * @function list
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all defined users:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured users.
 *
 * Configuration elements participating: `config:authentication:users`.
 *
 * Events raised via `dispatch`: `users:list-request`, `users:list-done`
 *
 * ```js
 * joola.dispatch.users.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.list = {
	name: "/api/users/list",
	description: "I list all available users",
	inputs: [],
	_outputExample: {},
	_permission: ['manage_system'],
	dispatch: function () {
		var self = this;
		joola.dispatch.on('users:list-request', function () {
			joola.logger.debug('Listing users.');
			self.run(function (err, value) {
				if (err)
					return joola.dispatch.emit('users:list-done', {err: err});

				joola.dispatch.emit('users:list-done', {err: null, message: value});
			});
		});
	},
	route: function (req, res) {
		var response = {};
		joola.dispatch.emitWait('users:list-request', {}, function (err, users) {
			if (err)
				return router.responseError(new router.ErrorTemplate('Failed to list users: ' + err), req, res);

			return router.responseSuccess(users, req, res);
		});
	},
	run: function (callback) {
		callback = callback || emptyfunc;
		joola.config.get('authentication:users', function (err, value) {
			if (err)
				return callback(err);

			if (typeof value === 'undefined')
				value = {};

			return callback(null, value);
		});
	}
};

/**
 * @function get
 * @param {Function} [callback] called following execution with errors and results.
 * Gets a specific user by username:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the requested user.
 *
 * Configuration elements participating: `config:authentication:users`.
 *
 * Events raised via `dispatch`: `users:get-request`, `users:get-done`
 *
 * ```js
 * joola.dispatch.users.get('tester', function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.get = {
	name: "/api/users/get",
	description: "I get a specific users by username",
	inputs: ['username'],
	_outputExample: {},
	_permission: ['manage_system'],
	dispatch: function () {
		var self = this;
		joola.dispatch.on('users:get-request', function (channel, username) {
			joola.logger.debug('Getting user.');
			self.run(username, function (err, value) {
				if (err)
					return joola.dispatch.emit('users:get-done', {err: err});

				joola.dispatch.emit('users:get-done', {err: null, message: value});
			});
		});
	},
	route: function (req, res) {
		var response = {};
		joola.dispatch.emitWait('users:get-request', req.params.username, function (err, user) {
			if (err)
				return router.responseError(new router.ErrorTemplate('Failed to get user: ' + err), req, res);

			return router.responseSuccess(user, req, res);
		});
	},
	run: function (username, callback) {
		callback = callback || emptyfunc;
		joola.config.get('authentication:users:' + username, function (err, value) {
			if (err)
				return callback(err);

			if (typeof value === 'undefined')
				value = {};

			return callback(null, value);
		});
	}
};

/**
 * @function add
 * @param {Object} options describes the new user
 * @param {Function} [callback] called following execution with errors and results.
 * Adds a new data source described in `options`:
 * - `username` of the new user
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added user.
 *
 * Configuration elements participating: `config:authentication:users`.
 *
 * Events raised via `dispatch`: `users:add-request`, `users:add-done`
 *
 * ```js
 * var options = {
 *   usernamename: 'newuser'
 * };
 *
 * joola.dispatch.users.add(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.add = {
	name: "/api/users/add",
	description: "I add a new user",
	inputs: ['user'],
	_outputExample: {},
	_permission: ['manage_system'],
	dispatch: function () {
		var self = this;
		joola.dispatch.on('users:add-request', function (channel, user) {
			joola.logger.debug('New user request [' + user.username + ']');
			self.run(user, function (err, value) {
				if (err)
					return joola.dispatch.emit('users:add-done', {err: err});

				joola.dispatch.emit('users:add-done', {err: null, message: value});
			});
		});
	},
	route: function (req, res) {
		try {
			var user = new proto({
				name: req.params.user.username
			});

			joola.dispatch.emitWait('users:add-request', user, function (err, _user) {
				if (err)
					return router.responseError(new router.ErrorTemplate('Failed to add new user: ' + err), req, res);
				return router.responseSuccess(_user, req, res);
			});
		}
		catch (err) {
			return router.responseError(new router.ErrorTemplate(err), req, res);
		}
	},
	run: function (user, callback) {
		callback = callback || emptyfunc;

		joola.config.get('authentication:users', function (err, value) {
			if (err)
				return callback(err);

			var _users;
			if (!value)
				_users = {};
			else
				_users = value;

			if (_users.hasOwnProperty(user.username))
				return callback(new Error('A user with username [' + user.username + '] already exists.'));
			_users[user.username] = user;
			joola.config.set('authentication:users', _users, function (err) {
				if (err)
					return callback(err);

				return callback(err, user);
			});
		});
	}
};

/**
 * @function list
 * @param {Object} options describes the user to delete
 * @param {Function} [callback] called following execution with errors and results.
 * Deletes a user described in `options`:
 * - `username` of the user to delete
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the deleted user.
 *
 * Configuration elements participating: `config:authentication:users`.
 *
 * Events raised via `dispatch`: `users:delete-request`, `users:delete-done`
 *
 * ```js
 * var options = {
 *   username: 'newuser'
 * };
 *
 * joola.dispatch.users.delete(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.delete = {
	name: "/api/users/delete",
	description: "I delete an existing user",
	inputs: ['user'],
	_outputExample: {},
	_permission: ['manage_system'],
	dispatch: function () {
		var self = this;
		joola.dispatch.on('users:delete-request', function (channel, user) {
			joola.logger.debug('user delete request [' + ds.name + ']');
			self.run(user, function (err, value) {
				if (err)
					return joola.dispatch.emit('users:delete-done', {err: err});

				joola.dispatch.emit('users:delete-done', {err: null, message: value});
			});
		});
	},
	route: function (req, res) {
		var response = {};
		try {
			var user = req.params.user;

			joola.dispatch.emitWait('users:delete-request', user, function (err, _user) {
				if (err)
					return router.responseError(new router.ErrorTemplate('Failed to delete user: ' + err), req, res);
				response.user = _user;
				return router.responseSuccess(response, req, res);
			});
		}
		catch (err) {
			return router.responseError(new router.ErrorTemplate(err), req, res);
		}
	},
	run: function (user, callback) {
		callback = callback || emptyfunc;

		joola.config.clear('authentication:users:' + user.username, function (err) {
			if (err)
				return callback(err);

			return callback(err, user);
		});
	}
};