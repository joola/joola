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
	flatiron = require('flatiron'),
	colors = require('colors'),
	forever = require('forever'),
	app = flatiron.app;

var joolaio = module.exports = flatiron.app;

require('pkginfo')(module, 'name', 'version');

joolaio.use(flatiron.plugins.cli, {
	version: true,
	usage: require('./joola.io/usage'),
	source: path.join(__dirname, 'joola.io', 'commands'),
	argv: {
		version: {
			alias: 'v',
			description: 'print joola.io version and exit',
			string: true
		},
		localconf: {
			description: 'search for .conf files in ./ and then parent directories',
			default: true,
			boolean: true
		},
		conf: {
			alias: 'c',
			description: 'specify path to load configuration from',
			string: true
		},
		colors: {
			description: '--no-colors will disable output coloring',
			default: true,
			boolean: true
		},
		raw: {
			description: 'joola.io will only output line-delimited raw JSON (useful for piping)',
			boolean: true
		}
	}
});

joolaio.options.log = {
	console: {
		raw: joolaio.argv.raw
	}
};

joolaio.prompt.properties = flatiron.common.mixin(
	joolaio.prompt.properties,
	require('./joola.io/properties')
);
joolaio.prompt.override = joolaio.argv;
require('./joola.io/config');
require('./joola.io/alias');
require('./joola.io/commands');

joolaio.started = false;
joolaio.common = require('./joola.io/common');

joolaio.welcome = function () {
	joolaio.log.info('Welcome to ' + 'joola.io'.grey);
	joolaio.log.info('joola.io v' + joolaio.version + ', node ' + process.version);
	joolaio.log.info('It worked if it ends with ' + 'joola.io'.grey.bold + ' ok'.green.bold);
};

joolaio.start = function (callback) {
	var useColors = (typeof joolaio.argv.colors == 'undefined' || joolaio.argv.colors);

	if (joolaio.argv._[0] === "whoami") {
		console.log(joolaio.config.get('username') || '');
		return;
	}

	joolaio.init(function (err) {
		if (err) {
			joolaio.welcome();
			joolaio.showError(joolaio.argv._.join(' '), err);
			return callback(err);
		}

		joolaio.common.checkVersion(function (err) {
			if (err) {
				return callback();
			}

			var minor, username;

			if (!joolaio.config.get('colors') || !useColors) {
				colors.mode = "none";
				joolaio.log.get('default').stripColors = true;
				joolaio.log.get('default').transports.console.colorize = false;
			}

			joolaio.welcome();

			minor = process.version.split('.')[1];

			if (parseInt(minor, 10) % 2) {
				joolaio.log.warn('You are using unstable version of node.js. You may experience problems.');
			}
			return joolaio.exec(joolaio.argv._, callback);
		});
	});
};

joolaio.exec = function (command, callback) {
	function execCommand(err) {
		if (err) {
			return callback(err);
		}

		if (command.length === 0)
			command.push('help');

		joolaio.log.info('Executing command ' + command.join(' ').magenta);
		joolaio.router.dispatch('on', command.join(' '), joolaio.log, function (err, shallow) {
			if (err) {
				joolaio.showError(command.join(' '), err, shallow);
				return callback(err);
			}

			callback();
		});
	}

	return !joolaio.started ? joolaio.setup(execCommand) : execCommand();
};

joolaio.setup = function (callback) {
	if (joolaio.started === true) {
		return callback();
	}

	joolaio.services = {
		start: function (name, options, callback) {
			var file = name;
			var spawnOptions = {
				max: 1,
				silent: false,
				minUptime: 2000,
				sourceDir: options.sourceDir,
				cwd: options.cwd,
				command: process.execPath.replace('Program Files', 'Progra~1')
			};

			var monitor = forever.startDaemon(file, spawnOptions).on('exit', function (code) {
				return callback(new Error('Failed to start service, usually due to port already being in use, exit code: ' + code));
			});

			if (options.verify) {
				require('sleep').sleep(1);
				var request = require('supertest')('http://localhost:' + options.controlport);
				request.get('/status').expect(200).end(function (err, res) {
					if (err)
						return callback(err);

					if (res.body.status == 'Running')
						return callback(null, {pid: monitor.pid});
					else
						return callback(new Error('Failed to verify service'));
				}).on('error', function (err) {
						return callback(new Error('Failed to start service, usually due to port already being in use: ' + err));
					});
			}
			else {
				return callback(null, {pid: monitor.pid});
			}
		},
		stop: function (name, options, callback) {
			if (options.verify) {
				var request = require('supertest')('http://localhost:' + options.controlport);
				request.get('/stop').expect(200).end(function (err, res) {
					return callback(null);
				});
			}
			else {
				return callback(new Error('Service must support controlport to be stopped.'));
			}
		}
	};
	joolaio.started = true;
	return callback();
};

joolaio.showError = function (command, err, shallow, skip) {
	var username,
		display,
		errors,
		stack;

	function unknownError(message, stack) {
		joolaio.log.error(message);
		stack.split('\n').forEach(function (line) {
			joolaio.log.error(line);
		});
	}

	function solenoidError(display) {
		joolaio.log.error('Error starting application. This could be a user error.');
		display.solenoid.split('\n').forEach(function (line) {
			joolaio.log.error(line);
		});
	}

	function appError(display) {
		if (display.output) {
			joolaio.log.error('Error output from application. This is usually a user error.');
			display.output.split('\n').forEach(function (line) {
				joolaio.log.error(line);
			});
		}

		return !display.solenoid ? unknownError(display.message, display.stack) : solenoidError(display);
	}

	if (err.statusCode === 403) {
		joolaio.log.error('403 ' + err.result.error);
	}

	else if (!skip) {
		joolaio.log.error('Error running command ' + command.magenta);
		if (!joolaio.config.get('nolog')) {
			//joolaio.logFile.log(err);
		}

		if (err.result) {
			if (err.result.message) {
				joolaio.log.error(err.result.message);
			}

			if (err.result.errors && Array.isArray(err.result.errors)) {
				errors = {
					connection: err.result.errors.filter(function (err) {
						return err.blame === 'connection';
					}),
					application: err.result.errors.filter(function (err) {
						return err.blame === 'application';
					}),
					solenoid: err.result.errors.filter(function (err) {
						return err.blame === 'solenoid';
					})
				};

				if (errors.application.length) {
					return appError(errors.application[0]);
				}
				else if (errors.solenoid.length) {
					return solenoidError(errors.solenoid[0]);
				}

				return errors.connection.length ? unknownError('Error connection:', errors.connection[0].stack) : unknownError('Error returned from joola.io:', err.result.errors[0].stack);
			}
			else if (err.result.stack) {
				return unknownError('Error returned from joola.io:', err.result.stack);
			}
		}
		else {
			err.stack.split('\n').forEach(function (trace) {
				joolaio.log.error(trace);
			});
		}

		if (err.message) {
			joolaio.log.error(err.message);
		}
	}

	joolaio.log.help("For help with this error contact joola.io Support:");
	joolaio.log.help("  webchat: <http://webchat.joola.io/>");
	joolaio.log.help("      irc: <irc://chat.freenode.net/#joola.io>");
	joolaio.log.help("    email: <support@joola.io>");
	joolaio.log.help("");
	joolaio.log.help("  Copy and paste this output to a gist (http://gist.github.com/)");
	joolaio.log.info('joola.io'.grey + ' not ok'.red.bold);
};