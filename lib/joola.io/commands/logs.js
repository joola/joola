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
	joolaio = require('../../joola.io'),
	util = require('util'),
	dateformat = require('dateformat'),
	utile = joolaio.common,
	logs = exports;

logs.usage = [
	'The `joola.io logs` command will display logs related to the framework',
	'The default number of lines to show is 100',
	'',
	'Example usages:',
	'joola.io logs tail',
	'joola.io logs service ' + '<service>'.magenta,
	'joola.io logs service ' + '<service>'.magenta + ' <number of lines to show>'
];
