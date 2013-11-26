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

var usage = exports;

usage._message = function () {
  var version = require('../../package.json').version

  var message = '\njoola.io version ' + version + '\n'
  message += 'http://joola.io\n';
  message += '\n';
  message += 'Usage: ' + 'joola.io [options]\n';
  message += '\n';
  message += 'Options:\n';
  message += '\n';
  message += '\t--help\t\t\toutput usage information\n';
  message += '\t--version\t\toutput the version number\n';
  message += '\t--repl\t\t\tallow REPL within console and on TCP port 1337\n';
  return message;
};

usage.printout = function () {
  console.log(usage._message());
};