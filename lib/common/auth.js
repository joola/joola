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
	url = require('url');

var whitelist_extensions = ['.js', '.png'];
var whitelist_endpoints = ['/login'];
var bypassToken = '123';

function AuthErrorTemplate(err) {
	this.name = 'joola.io.engine Authentication Exception';
	this.code = 401;
	if (err.message) this.message = err.message; else this.message = err || '';
	if (err.stack) this.stack = err.stack; else this.stack = null;
}

AuthErrorTemplate.prototype = Error.prototype;
exports.AuthErrorTemplate = AuthErrorTemplate;

exports.validateToken = function (token, callback) {
	if (token == bypassToken)
		return callback(null, true);

	return callback(new Error('Failed to validate token [' + token + ']'));
};

exports.validateRoute = function (req, res, callback) {
	var modulename = req.param.resource;
	var action = req.param.action;
	var module;

	if (!modulename)
		return callback(new Error('Module not specified.'));

	try {
		module = require('../routes/api/' + modulename);
	}
	catch (ex) {
		console.log('err', ex);
		console.log(ex.stack);
		return callback(ex);
	}

	if (!action)
		action = 'index';

	try {
		action = module[action];


	}
	catch (err) {
		return callback(err);
	}
};

/**
 * @function validateAction
 * @param {Object} action contain the `action` we wish to validate.
 * @param {Object} req holds the http request.
 * @param {Object} res holds the http response.
 * @param {Object} callback called following execution with errors and results.
 * Validates the request has required parameters and that the user has permission to access the `action`.
 * The `action` parameter holds an endpoint, for example `joola.dispatch.datasources.list`. The endpoint includes a list
 * of allowed parameters and the actual list sent `req.params` is inspected. If a parameter exists in `req.params`, but not
 * in the allow list, it is ignored and not passed along to the `action`.
 * The next step is to validate permissions, for that the user is retrieved from `req.user` which was set earlier by `validateToken`.
 * The endpoint holds a list of allowed `roles` and the existing user roles is compared against it.
 * If all conditions are met, then the function calls a callback with a `true` result.
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains a {boolean} indicating if the action is validated.
 *
 * Configuration elements participating: `config:authentication`.
 *
 * ```js
 * var action = joola.dispatch.datasources.list;
 * //req is an http request with a valid token
 * joola.auth.validateAction(action, req, res, function(err, bValidToken) {
 * 	console.log(err, bValidToken);
 * }
 * ```
 */
exports.validateAction = function (action, req, res, callback) {
	if (req.method == 'OPTIONS')
		return callback(null, true);

	var required = action.inputs.required;
	var optional = action.inputs.optional;

	var _params = [];
	_params.resource = req.params.resource;
	_params.action = req.params.action;
	_params.minres = req.params.minres;

	required.forEach(function (param) {
		if (!req.params[param])
			return callback(new ErrorTemplate('Required param [' + param + '] is missing.'), false);
		_params[param ] = req.params[param];
	});

	optional.forEach(function (param) {
		if (req.params[param])
			_params[param] = req.params[param];
		else
			_params[param] = '';
	});

	req.debug = {};
	Object.keys(_params).forEach(function (key) {
		req.debug[key] = _params[key];
	});

	req.params = _params;

	if (!req.user)
		return callback(new ErrorTemplate('Request for action by unauthenticated user.'), false);

	var userPermissions = [];
	req.user._roles.forEach(function (role) {
		joola.config.auth.roles.forEach(function (roleToCompareAgainst) {
			if (role === roleToCompareAgainst.id) {
				userPermissions = userPermissions.concat(roleToCompareAgainst.permissions);
			}
		});
	});

	if (util.isArray(action.permission))
		action.permission = action.permission[0];
	if (userPermissions.indexOf(action.permission) == -1)
		return callback(new ErrorTemplate('Missing permission to run this action. [action:' + action.name + '][permission:' + action.permission + '][roles:' + JSON.stringify(req.user._roles) + ']'), false);

	return callback(null, true);
};

/**
 * @function middleware
 * @param {Object} req holds the http request.
 * @param {Object} res holds the http response.
 * @param {Object} next called upon completion.
 * The actual middleware function that handles every incoming request for non-static resources and actions.
 * The main logic flow is:
 *  - Check if action/resource is whitelisted
 *  - Try to locate a token for this request, if none show login/401
 *  - Validate the token
 *  - Validate the route
 *  - If all is well, run the request
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 *
 * Configuration elements participating: `config:authentication`.
 *
 * Events raised via `dispatch`: `auth:login-request`, `auth:login-success`, `auth:login-fail`
 */
exports.middleware = function (req, res, next) {
	var parts = url.parse(req.url);

	//allow static content to pass
	if (whitelist_extensions.indexOf(path.extname(parts.pathname)) > -1)
		return next();

	joola.logger.silly('Authentication request [' + parts.pathname + ']');
	//allow white-listed endpoints to pass through, for example /login
	if (whitelist_endpoints.indexOf(parts.pathname) > -1)
		return next();

	//check if we have a valid token as part of the request
	//check query string for `token`
	var token = req.query.token;
	//check query string for `token`
	if (!token)
		token = req.headers['joolaio-token'];
	if (!token)
	//we have no token, redirect the page to login
		return res.redirect('/login?redirect=' + encodeURIComponent(req.url));

	//We have a token, let's validate
	exports.validateToken(token, function (err, valid) {
		if (valid)
			joola.logger.silly('Token [' + token + '] is valid.');
		else {
			//we have invalid token, throw an exception
			joola.logger.info('Token [' + token + '] is invalid.');
			throw new AuthErrorTemplate(err);
		}

		//we need to validate the route.
		// we check that the user has permissions to run the action.
		exports.validateRoute(req, res, function (err, valid) {

		});
	});
};