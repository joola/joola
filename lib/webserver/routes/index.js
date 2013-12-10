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
//auth = require('../lib/auth/manager'),
//query = require('./query'),
	_ = require('underscore'),
	util = require('util');

function ErrorTemplate(err) {
	this.name = 'joola.io.engine Exception';
	this.code = 500;
	if (err.message) this.message = err.message; else this.message = err || '';
	if (err.stack) this.stack = err.stack; else this.stack = null;
}
ErrorTemplate.prototype = Error.prototype;
exports.ErrorTemplate = ErrorTemplate;

function AuthErrorTemplate(err) {
	this.name = 'joola.io.engine Authentication Exception';
	this.code = 401;
	if (err.message) this.message = err.message; else this.message = err || '';
	if (err.stack) this.stack = err.stack; else this.stack = null;
}
AuthErrorTemplate.prototype = ErrorTemplate.prototype;
exports.AuthErrorTemplate = AuthErrorTemplate;

exports.responseError = function (err, req, res) {
	joola.logger.warn('Error while processing route [' + req.url + ']: ' + err);
	if (err.code && err.code == 401){
		res.status(401);
	}
	else if (err.code && err.code == 'MODULE_NOT_FOUND')
		res.status(404);
	else
		res.status(500);

	res.json(err);
	res.handled = true;
};

exports.responseSuccess = function (data, req, res) {
	var response = {};

	try {
		if (req.token)
			res.setHeader('joola-token', req.token);

		if (!req.params.minres) {
			response.id = joola.common.uuid();
			response.timestamp = new Date();
			response.success = true;
			response.details = {};
			response.details.request = req.debug;
		}
		response = _.extend(response, data);
		response.result = data;
		res.status(200);
		res.json(response);
	}
	catch (ex) {
		console.log('response exception', ex.message);
		console.dir(ex);
		throw ex;
	}
};

exports.index = function (req, res) {
	if (joola.state.get().status != 'online')
		return res.render('server-offline');

	res.render('index');
};

exports.manage_index = function (req, res) {
	res.render('index');
};

exports.analytics_index = function (req, res) {
	if (joola.state.get().status != 'online')
		return res.render('server-offline');

	res.render('index');
};

exports.configure = function (req, res) {
	res.render('configure');
};

exports.logger = function (req, res) {
	res.render('logger');
};

/*
 exports.validateToken = function (req, res, callback) {
 var failed = function (err) {
 if (req.method == 'OPTIONS' || req.url.substring(req.url.length - 3) == 'ico') {
 return callback(null, true);
 }
 else {
 if (err) {
 console.log(err);
 joola.logger.warn('Failed to validate security token: ' + err);
 }
 else
 joola.logger.warn('Detected a connection without a valid token accessing action: ' + req.params.resource + '/' + (req.params.action ? req.params.action : '') + '.');
 return callback(null, false);
 }
 };

 var validate = function (token, forceValidated) {
 auth.validateToken(token, function (err, user, _token) {
 if ((joola.config.server.bypassToken != null && token == joola.config.server.bypassToken) || joola.config.auth.store == 'none' || forceValidated) {
 if (!_token)
 _token = '1234567890';
 user = {
 id: 1,
 displayName: 'Anonymous User',
 _roles: ['admin', 'user']
 };
 }
 else if (err) {
 return failed(err);
 }


 if (user) {
 joola.logger.silly('Token [' + _token + '] validated.');
 req.user = user;
 req.token = _token;

 return callback(null, true);
 }
 else {
 joola.logger.error('Token [' + token + '] is invalid.');
 return failed();
 }
 });
 };

 var approvedActions = [];
 approvedActions.push('auth/login');
 approvedActions.push('auth/loginSSO');
 approvedActions.push('auth/loginNeeded');
 approvedActions.push('auth/checkToken');

 var token = req.headers['joola-token'];
 if (token == null || typeof(token) == 'undefined' || token == 'undefined')
 token = req.query.token;

 if (approvedActions.indexOf(req.params.resource + (req.params.action ? '/' + req.params.action : '')) != -1) {
 joola.logger.silly('Approved action detected, bypassing token inspection.');
 //return callback(null, true);
 return validate(token, true);
 }

 if (token || joola.config.auth.store == 'none')
 return validate(token);
 else
 return failed();
 };
 */

/*
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
 */
exports.route = function (req, res) {
	if (joola.state.get().status != 'online') {
		if (res.render)
			return res.render('server-offline');
		else
			return res.json('server-offline');
	}

	var modulename = req.params.resource;
	var module;
	var action = req.params.action;

	if (['png', 'ico', 'gif', 'css'].indexOf(req.url.substring(req.url.length - 3)) > -1)
		return exports.responseError(new ErrorTemplate('Not implemented.'), req, res);

	_.extend(req.params, req.query);

	//exports.validateToken(req, res, function (err, validated) {
	//if (err)
	//  return exports.responseError(err, req, res);
	//  else if (!validated)
	//   return exports.responseError(new AuthErrorTemplate('Authentication failed.'), req, res);

	joola.logger.silly('Token verified ' + req.token);

	if (!modulename)
		return exports.responseError(new ErrorTemplate('Module not specified.'), req, res);

	try {
		module = require('../../dispatch/' + modulename);
	}
	catch (ex) {
		console.log('err', ex);
		console.log(ex.stack);
		return exports.responseError(ex, req, res);
	}

	if (!action)
		action = 'index';

	try {
		action = module[action];
		//exports.validateAction(action, req, res, function (err, validated) {
		//  if (err)
		//    return exports.responseError(err, req, res);
		//  else if (!validated)
		//    return exports.responseError(new ErrorTemplate('Failed to validate action.'), req, res);

		if (req.params[0] instanceof Object)
			req.params = req.params[0];

		Object.keys(req.params).forEach(function (key) {
			try {
				req.params[key] = JSON.parse(req.params[key]);
			}
			catch (ex) {
				//ignore
			}
		});
		joola.logger.silly('Routing [' + action.name + ']...');
		return action.route(req, res);
		//});
	}
	catch (ex) {
		console.log('err', ex);
		console.log(ex.stack);
		return exports.responseError(ex, req, res);
	}
	//});
};

exports.sdk = function (req, res) {
	return require('./sdk').index(req, res);
};

exports.generateerror = function (req, res) {
	throw new Error('Error for testing');
};

exports.login = function (req, res) {
	res.render('login');
}

exports.logout = function (req, res) {
	res.render('login');
}

exports.setup = function (app) {
	//main entry point
	app.get('/', this.index);
	app.get('/login', this.login);
	app.get('/logout', this.logout);

	//for tests
	app.get('/createantesterror', this.generateerror);

	//api, analytics and manage
	this.setupAPI(app);
	this.setupAnalytics(app);
	this.setupManage(app);
};

exports.setupAPI = function (app) {
	//api routes
	app.get('/api/:resource/:action', this.route);
};

exports.setupManage = function (app) {
	//main entry points
	app.get('/manage/', this.manage_index);
	app.get('/manage/index', this.manage_index);

	app.get('/manage/:resource/:action', function (req, res) {
		res.render(req.params.resource + '/' + req.params.action);
	});
};

exports.setupAnalytics = function () {
	//main entry points
	app.get('/analytics/', this.analytics_index);
	app.get('/analytics/index', this.analytics_index);
	app.get('/joola.io.js', this.sdk);

	app.get('/analytics/:resource/:action', function (req, res) {
		res.render(req.params.resource + '/' + req.params.action);
	});
};