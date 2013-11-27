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

var base = exports;

base.validate = function (options) {
  var validated = true;
  var proto = this._proto;
  Object.keys(proto).forEach(function (key) {
    if (validated && proto[key].required && (!options.hasOwnProperty(key) || (options.hasOwnProperty(key) && !options[key]))) {
      validated = false;
    }
  });
  return validated;
};
