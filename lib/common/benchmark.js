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

var benchmark = exports;

benchmark.byteCount = function (s) {
  return encodeURI(s).split(/%..|./).length - 1;
};

benchmark.setup = function () {
  var str = "";

  var i = 100000;
  while (i--) {
    str += " This is a test.";
  }

  return str;
};