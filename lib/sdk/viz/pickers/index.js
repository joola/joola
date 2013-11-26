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

var pickers = module.exports = exports;
pickers._id = 'pickers';

pickers.datepicker = require('./datepicker');

pickers.init = function (callback) {
  return callback(null);
  //return pickers.datepicker.init(callback);
};

