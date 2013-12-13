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
	crypto = require('crypto'),
	router = require('../webserver/routes/index'),
	Proto = require('./prototypes/user');

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
		joola.dispatch.emitWait('users:list-request', {}, function (err, users) {

			if (err) {
				return router.responseError(new router.ErrorTemplate('Failed to list users: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
			}

			return router.responseSuccess(users, req, res);
		});
	},
	run: function (callback) {
		callback = callback || emptyfunc;
		joola.config.get('authentication:users', function (err, value) {
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

		joola.dispatch.emitWait('users:get-request', req.params.username, function (err, user) {
			if (err)
				return router.responseError(new router.ErrorTemplate('Failed to get user: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

			return router.responseSuccess(user, req, res);
		});
	},
	run: function (username, callback) {
		callback = callback || emptyfunc;
		joola.config.get('authentication:users:' + username, function (err, value) {
			if (err)
				return callback(err);

			if (typeof value === 'undefined')
				return callback(new Error('User [' + username + '] does not exist.'));

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
 *   username: 'newuser'
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
			var user = {
				username: req.params.user.username,
				displayName: req.params.user.displayName,
				_email: req.params.user._email,
				_password: req.params.user._password,
				_roles: req.params.user._roles,
				_filter: req.params.user._filter
			};

			joola.dispatch.emitWait('users:add-request', user, function (err, _user) {
				if (err)
					return router.responseError(new router.ErrorTemplate('Failed to add new user: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
				return router.responseSuccess(_user, req, res);
			});
		}
		catch (err) {
			return router.responseError(new router.ErrorTemplate(err), req, res);
		}
	},
	run: function (user, callback) {
		callback = callback || emptyfunc;

		try {
			user = new Proto(user);
		} catch (ex) {
			return callback(ex);
		}
		user._password = exports.hashPassword.run(user._password);
		if (user._password === null)
			return callback(new Error('Failed to hash password'));

		joola.config.get('authentication:users', function (err, value) {
			if (err)
				return callback(err);

			var _users;
			if (!value)
				_users = {};
			else
				_users = value;

			if (_users[user.username])
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
 * @function update
 * @param {Object} options describes the user to update and the new details
 * @param {Function} [callback] called following execution with errors and results.
 * Updates an existing user described in `options`:
 * - `username` name of the user (cannot be updated)
 * - `displayName` pretty name for the user.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the newly added user.
 *
 * Configuration elements participating: `config:authentication:users`.
 *
 * Events raised via `dispatch`: `users:update-request`, `users:update-done`
 *
 * ```js
 * var options = {
 *   username: 'newuser',
 *   displayName: 'updated display name'
 * };
 *
 * joola.dispatch.users.update(options, function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
exports.update = {
	name: "/api/users/update",
	description: "I update an existing user",
	inputs: ['user'],
	_outputExample: {},
	_permission: ['manage_system'],
	dispatch: function () {
		var self = this;
		joola.dispatch.on('users:update-request', function (channel, user) {
			joola.logger.debug('Update user request [' + user.username + ']');
			self.run(user, function (err, value) {
				if (err)
					return joola.dispatch.emit('users:update-done', {err: err});

				joola.dispatch.emit('users:update-done', {err: null, message: value});
			});
		});
	},
	route: function (req, res) {
		try {
			var user = {
				username: req.params.user.username,
				displayName: req.params.user.displayName,
				_email: req.params.user._email,
				_password: req.params.user._password,
				_roles: req.params.user._roles,
				_filter: req.params.user._filter
			};

			joola.dispatch.emitWait('users:update-request', user, function (err, _user) {
				if (err)
					return router.responseError(new router.ErrorTemplate('Failed to update user: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
				return router.responseSuccess(_user, req, res);
			});
		}
		catch (err) {
			return router.responseError(new router.ErrorTemplate(err), req, res);
		}
	},
	run: function (user, callback) {
		callback = callback || emptyfunc;

		try {
			user = new Proto(user);
		} catch (ex) {
			return callback(ex);
		}
		//user._password = exports.hashPassword(user._password);
		if (user._password === null)
			return callback(new Error('Failed to hash password'));

		joola.config.get('authentication:users', function (err, value) {
			if (err)
				return callback(err);

			var _users;
			if (!value)
				_users = {};
			else
				_users = value;

			if (!_users.hasOwnProperty(user.username))
				return callback(new Error('User with username [' + user.username + '] does not exist.'));
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
			joola.logger.debug('user delete request [' + user.name + ']');
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
					return router.responseError(new router.ErrorTemplate('Failed to delete user: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
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

		exports.get.run(user.username, function (err, value) {
			if (err)
				return callback(err);

			joola.config.clear('authentication:users:' + user.username, function (err) {
				if (err)
					return callback(err);

				joola.config.get('authentication:users:' + user.username, function (err, value) {
					if (err)
						return callback(err);
					if (!value)
						return callback(null, user);

					return callback(new Error('Failed to delete user [' + user.username + '].'));
				});
			});
		});
	}
};

/**
 * @function hashPassword
 * @param {string} plainPassword contains a simple text, plain password for hashing
 * @return {string} hashed password with the hash.
 * Hashes a plain text password using MD5.
 * - `plainPassword` is the plain password to hash
 *
 * The function returns on completion a hashed string.
 *
 * ```js
 * var plainPassword = 'password'
 * var hashed = joola.dispatch.users.hashPassword(plainPassword);
 * console.log(plainPassword, hashed);
 * ```
 */
exports.hashPassword = {
	name: "/api/users/hashPassword",
	description: "I hash passwords",
	inputs: ['plainPassword'],
	_outputExample: {},
	_permission: ['manage_system'],
	dispatch: function () {

	},
	route: function (req, res, next) {
		return next();
	},
	run: function (plainPassword) {
		if (!plainPassword)
			return null;
		try {
			return crypto.createHash('md5').update(plainPassword.toString()).digest('hex');
		}
		catch (ex) {
			joola.logger.warn('Failed to hash password [' + plainPassword + ']: ' + ex.message);
			return null;
		}
	}
};

/**
 * @function authenticate
 * @param {string} username contains username to authenticate
 * @param {string} password contains plain password for comparison to stored hash
 * @return {string} hashed password with the hash.
 * Authenticates a user given username/password
 * - `username` contains username to authenticate
 * - `password` contains plain password for comparison to stored hash
 *
 * The function returns on completion a boolean indicating if the user is authenticated
 *
 * ```js
 * var plainPassword = 'password'
 * var authenticated = joola.dispatch.users.authenticate('user', 'password');
 * console.log(authenticated);
 * ```
 */
exports.authenticate = {
	name: "/api/users/authenticate",
	description: "I authenticate users",
	inputs: ['username', 'password'],
	_outputExample: {},
	_permission: ['access_system'],
	dispatch: function () {
		var self = this;
		joola.dispatch.on('users:authenticate-request', function (channel, message) {
			var username = message.username;
			var password = message.password;
			joola.logger.debug('authenticate request [' + username + ']');
			self.run(username, password, function (err, value) {
				if (err)
					return joola.dispatch.emit('users:authenticate-done', {err: err});

				joola.dispatch.emit('users:authenticate-done', {err: null, message: value});
			});
		});
	},
	route: function (req, res) {
		try {
			var username = req.params.username;
			var password = req.params.password;

			joola.dispatch.emitWait('users:authenticate-request', {username: username, password: password}, function (err, _user) {
				if (err)
					return router.responseError(new router.ErrorTemplate('Failed to authenticate user: ' + (typeof(err) === 'object' ? err.message : err)), req, res);
				return router.responseSuccess(_user, req, res);
			});
		}
		catch (err) {
			return router.responseError(new router.ErrorTemplate(err), req, res);
		}
	},
	run: function (username, password, callback) {
		if (!username)
			return callback(new Error('Username not provided'));
		if (!password)
			return callback(new Error('Password not provided'));

		exports.get.run(username, function (err, user) {
			if (err)
				return callback(err);

			if (user._password == exports.hashPassword.run(password))
				return callback(err, user);
			else
				return callback(new Error('Invalid password provided for user [' + username + ']'));
		});
	}
};