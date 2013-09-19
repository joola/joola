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
	flatiron = require('flatiron'),
	request = require('request'),
	joolaio = require('../../joola.io');

var common = module.exports = flatiron.common.mixin({}, flatiron.common);

common.checkVersion = function (callback) {
	var responded = false

	//
	// Check the GitHub tags for `jitsu` to see if the current
	// version is outdated. If it is not make sure to message the user at the end.
	//
	request({
		uri: 'http://registry.npmjs.org/joola.io/latest',
		timeout: 1000
	}, function (err, res, body) {
		if (!responded) {
			responded = true;

			try {
				var pkg = JSON.parse(body);

				if (semver.gt(pkg.version, joolaio.version)) {
					joolaio.log.warn('A newer version of ' + 'joola.io'.magenta + ' is available. ' + 'please update immediately');
					joolaio.log.help('To install the latest ' + 'joola.io'.magenta + ' type `[sudo] npm install joola.io`');
					joolaio.log.warn('To ' + 'continue'.bold + ' without an update ' + 'type'.cyan + ' ' + '\'yes\''.magenta);

					joolaio.prompt.confirm('Continue without updating? Bad things might happen (no)', function (err, result) {
						return err ? callback() : callback(!result);
					});

					return;
				}

				callback();
			}
			catch (ex) {
				//
				// Ignore errors from GitHub. We will notify the user
				// of an upgrade at the next possible opportunity.
				//
				callback();
			}
		}
	});
};