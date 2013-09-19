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
	async = require('async'),
	joolaio = require('../../joola.io'),
	utils = joolaio.common,
	services = exports;

services._services = {
	engine: {
		title: 'joola.io Engine',
		servicePath: 'joola.io.engine.js',
		sourceDir: path.join(__dirname, '../../../node_modules/joola.io.engine/'),
		cwd: path.join(__dirname, '../../../node_modules/joola.io.engine/'),
	},
	web: {
		title: 'joola.io Analytics Site',
		servicePath: 'joola.io.analytics.js',
		sourceDir: path.join(__dirname, '../../../node_modules/joola.io.analytics/'),
		cwd: path.join(__dirname, '../../../node_modules/joola.io.analytics/'),
		verify: true,
		controlport: 42101
	}
};

services.usage = [
	'The `joola.io services` command manages',
	'services part of the framework. Valid commands are:',
	'',
	'joola.io services list',
	'joola.io services start   ' + '[<service>]'.magenta,
	'joola.io services restart ' + '[<service>]'.magenta,
	'joola.io services stop    ' + '[<service>]'.magenta,
	''
];


services.list = function (callback) {
	joolaio.log.info('Listing services...');

	var rows = [
			['service', 'script', 'status', 'pid']
		],
		colors = ['underline', 'underline', 'underline', 'underline'];


	var calls = [];
	Object.keys(services._services).forEach(function (key) {
		var service = services._services[key];
		if (service.verify == true) {
			var call = function (callback) {
				var request = require('supertest')('http://localhost:' + service.controlport);
				request.get('/status').expect(200).end(function (err, res) {
					if (err) {
						service.status = 'Not running';
						rows.push([
							service.title,
							service.servicePath,
							service.status || 'Unknown',
							service.pid || 'Unknown'
						]);
						return callback(err);
					}

					service.status = res.body.status;
					service.pid = res.body.pid;

					rows.push([
						service.title,
						service.servicePath,
						service.status || 'Unknown',
						service.pid || 'Unknown'
					]);
					return  callback();
				}).on('error', function (err) {
						service.status = 'Not running';
						rows.push([
							service.title,
							service.servicePath,
							service.status || 'Unknown',
							service.pid || 'Unknown'
						]);
						return callback(err);
					});
			};
			calls.push(call);
		}
		else {
			rows.push([
				service.title,
				service.servicePath,
				service.status || 'Unknown',
				service.pid || 'Unknown'
			]);
		}
	});

	async.parallel(calls, function () {
		joolaio.inspect.putRows('data', rows, colors);
		return callback();
	});
};

//
// Usage for `joolaio apps restart [<name>]`
//
services.list.usage = [
	'Lists all available services and their current status.',
	'',
	'joola.io services list'
];

services.start = function (name, callback) {
	if (arguments.length) {
		var args = utils.args(arguments);
		callback = args.callback;
		name = args[0] || null;
	}

	if (!name || name == 'all') {
		name = 'all';

		services.start('engine', function () {
			services.start('web', function () {
			});
		});
	}

	var options = {};
	switch (name) {
		case 'all':
			break;
		case 'engine':
			options = services._services['engine'];
			break;
		case 'web':
			options = services._services['web'];
			break;
		default:
			joolaio.log.warn('Service \'' + name + '\' is unknown.');
			joolaio.log.error('joola.io services start <service>');
			return callback(new Error('Service \'' + name + '\' is unknown.'));
			break;
	}

	function executeStart(options) {
		joolaio.log.info('Starting service ' + name.magenta);

		var showInfo = function showInfo(err, details) {
			if (err) {
				joolaio.log.error('Failed to start service ' + name.magenta);
				return callback(err);
			}

			joolaio.log.info('Service ' + name.magenta + ' is now started, pid: ' + details.pid.toString().magenta);
			callback();
		};

		return joolaio.services.start(options.servicePath, options, showInfo);
	}

	if (name != 'all')
		executeStart(options);
};

services.start.usage = [
	'Starts the named <name> service. If no <name> is provided than all services are started.',
	'',
	'joola.io services start <name>'
];

services.restart = function (name, callback) {
	var self = module.exports;
	function executeRestart(name) {
		joolaio.log.info('Restarting service ' + name.magenta);

		self.stop(name, function () {
			self.start(name, function () {
				return callback();
			})
		});
	}

	if (!name || name == 'all') {
		name = 'all';

		self.restart('engine', function () {
			self.restart('web', function () {
				callback();
			});
		});
	}

	if (name != 'all')
		executeRestart(name);
};

services.restart.usage = [
	'Restarts the named <service>. ',
	'',
	'joola.io services restart <name>'
];

services.stop = function (name, callback) {
	function executeStop(options) {
		joolaio.log.info('Stopping service ' + name.magenta);
		var showInfo = function showInfo(err, details) {
			if (err) {
				joolaio.log.error('Failed to stop service ' + name.magenta);
				return callback(err);
			}

			joolaio.log.info('Service ' + name.magenta + ' is now stopped.');
			callback();
		};

		return joolaio.services.stop(options.servicePath, options, showInfo);
	};

	if (!name) {
		joolaio.log.warn('Service <name> must be specified.')
		joolaio.log.error('joola.io services stop <name>')
		return callback(new Error('Service <name> must be specified.'));
	}

	var options = {};
	options = services._services[name];
	if (!options || options == null) {
		joolaio.log.warn('Service \'' + name + '\' is unknown.');
		joolaio.log.error('joola.io services start <service>');
		return callback(new Error('Service \'' + name + '\' is unknown.'));
	}

	executeStop(options);
};

services.stop.usage = [
	'Stops the service running with the named <service>.',
	'',
	'joola.io services stop <service>'
];