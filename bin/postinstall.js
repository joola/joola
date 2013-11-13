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
	fs = require('fs'),
	path = require('path');

try {
	fs.mkdirSync('../../logs');
}
catch (ex) {
	if (ex.code == 'EEXIST')
		console.log('Directory exists, skipping');
	else
		throw ex;
}
try {
	fs.createReadStream(path.join(__dirname, 'service.json')).pipe(fs.createWriteStream('../../service.json'));
}
catch (ex) {
	throw ex;
}

	