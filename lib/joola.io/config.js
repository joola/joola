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

var path = require('path'),
	joolaio = require('../joola.io');

//
// Store the original `jitsu.config.load()` function
// for later use.
//
var _load = joolaio.config.load;

//
// Update env if using Windows
//
if (process.platform == "win32") {
	process.env.HOME = process.env.USERPROFILE;
}

//
// Setup target file for `.jitsuconf`.
//
//
// TODO: Refactor broadway to emit `bootstrap:after` and put this
//       code in a handler for that event
//
try {
	joolaio.config.env().file({
		file: joolaio.argv.conf || joolaio.argv.j || '.conf',
		dir: process.env.HOME,
		search: true
	});
}
catch (err) {
	console.log('Error parsing ' + joolaio.config.stores.file.file.magenta);
	console.log(err.message);
	console.log('');
	console.log('This is most likely not an error in jitsu');
	console.log('Please check the .jitsuconf file and try again');
	console.log('');
	process.exit(1);
}


var defaults = {
	analyze: true,
	"apiTokenName": 'joolaio',
	release: 'build',
	colors: true,
	loglevel: 'info',
	loglength: 110,
	protocol: 'https',
	remoteHost: 'api.joolaio.com',
	requiresAuth: ['apps', 'databases', 'env', 'logs', 'snapshots'],
	root: process.env.HOME,
	timeout: 4 * 60 * 1000,
	tmproot: path.join(process.env.HOME, '.joolaio/tmp'),
	userconfig: '.conf',
	logs: {
		host: "logs.joola.io",
		port: 443,
		protocol: "https"
	}
};

Object.defineProperty(defaults, 'remoteUri', {
	get: function () {
		var port = joolaio.config.get('port') || '';
		if (port) {
			port = ':' + port;
		}

		return [joolaio.config.get('protocol'), '://', joolaio.config.get('remoteHost'), port].join('');
	}
});

//
// Set defaults for `jitsu.config`.
//
joolaio.config.defaults(defaults);

//
// Use the `flatiron-cli-config` plugin for `jitsu config *` commands
//
joolaio.use(require('flatiron-cli-config'), {
	store: 'file',
	restricted: [
		'auth',
		'root',
		'remoteUri',
		'tmproot',
		'userconfig'
	],
	before: {
		list: function () {
			var username = joolaio.config.get('username'),
				configFile = joolaio.config.stores.file.file;

			var display = [
				' here is the ' + configFile.grey + ' file:',
				'To change a property type:',
				'jitsu config set <key> <value>',
			];

			if (!username) {
				joolaio.log.warn('No user has been setup on this machine');
				display[0] = 'Hello' + display[0];
			}
			else {
				display[0] = 'Hello ' + username.green + display[0];
			}

			display.forEach(function (line) {
				joolaio.log.help(line);
			});

			return true;
		}
	}
});

//
// Override `jitsu.config.load` so that we can map
// some existing properties to their correct location.
//
joolaio.config.load = function (callback) {
	_load.call(joolaio.config, function (err, store) {
		if (err) {
			return callback(err, true, true, true);
		}

		joolaio.config.set('userconfig', joolaio.config.stores.file.file);

		if (store.auth) {
			var auth = store.auth.split(':');
			joolaio.config.clear('auth');
			joolaio.config.set('username', auth[0]);
			joolaio.config.set('password', auth[1]);
			// create a new token and remove password from being saved to .jitsuconf
			joolaio.tokens.create(auth[0], (joolaio.config.get('apiTokenName')||'jitsu'), function(err, result) {
				if(!err && result) {
					var token = Object.getOwnPropertyNames(result).filter(function(n){return n !== 'operation'}).pop();
					joolaio.config.set('apiToken', result[token]);
					joolaio.config.set('apiTokenName', token);
					joolaio.config.clear('password');
					return joolaio.config.save(callback);
				}
			});


		}

		callback(null, store);
	});
};