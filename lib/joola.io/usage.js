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

var colors = require('colors');

module.exports = [
	'    _             _         _       '.cyan,
	'   (_)           | |       (_)      '.cyan,
	'    _  ___   ___ | | __ _   _  ___  '.cyan,
	'   | |/ _ \\ / _ \\| |/ _` | | |/ _ \\ '.cyan,
	'   | | (_) | (_) | | (_| |_| | (_) |'.cyan,
	'   | |\\___/ \\___/|_|\\__,_(_)_|\\___/ '.cyan,
	'  _/ |                              '.cyan,
	' |__/                               '.cyan,
	'',

	'The open-source data visualization framework.',
	'https://github.com/joola/joola.io',
	'',

	'Usage:'.cyan.bold.underline,
	'',
	'  joola.io'.grey.bold + ' <resource>'.magenta + ' <action>'.yellow + ' <param1> <param2> ...',
	'',

	'Common Commands:'.cyan.bold.underline,
	'',

	'Displays current status of services'.cyan,
	'  joola.io status',
	'',

	'Lists all running services'.cyan,
	'  joola.io showall',
	'',

	'Additional Commands'.cyan.bold.underline,
	'  joola.io services',
	'  joola.io logs',
	'  joola.io env',
	'  joola.io conf',
	'  joola.io users',
	'  joola.io logout'
];