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

var joolaio = require('../joola.io');

//
// Simplify CLI
//

joolaio.alias('stop',    { resource: 'services',   command: 'stop' });
joolaio.alias('start',   { resource: 'services',   command: 'start' });
joolaio.alias('restart', { resource: 'services',   command: 'restart' });