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

require('../lib/joola.io/completion');
process.title = 'joola.io';

var joolaio = require('../lib/joola.io');

joolaio.start(function (err) {
	if (!err) {
		joolaio.log.info('joola.io'.grey + ' ok'.green.bold);
	}

	process.exit(err ? 1 : 0);
});