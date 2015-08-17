/**
 *  joola
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

'use strict';

var joola = require('../joola');

try {
  module.exports = require('geoip-lite');
  joola.logger.info('Found geoip-lite module.');
}
catch (ex) {
  joola.logger.warn('Could not find geoip-lite module.');
  exports.lookup = function (ip) {
    return ip;
  };
}
