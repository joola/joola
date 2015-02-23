/**
 *  @title joola/lib/common/cli
 *  @overview Provides CLI functionality and management for the runtime.
 *  @description
 *  When joola is executed, it can be started with arguments, and it is required to parse them and combine
 *  with the runtime logic. The following module is designed for this purpose. It contains the usage message and a function
 *  to process the arguments passed (if anything is needed).
 *  Some arguments made cause the runtime to exit immediately after serving the response, for example --version which will
 *  cause the runtime to print out the version number and stop execution.
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/

'use strict';

var joola = require('../joola');
var cli = exports;

/**
 * Provides the usage template to return when using --help
 * @return {string} the usage message
 */
cli._message = function () {
  var version = require('../../package.json').version;

  var message = '\njoola version ' + version + '\n';
  message += 'http://joola\n';
  message += '\n';
  message += 'Usage: ' + 'joola [options]\n';
  message += '\n';
  message += 'Options:\n';
  message += '\n';
  message += '\t--help\t\t\toutput usage information\n';
  message += '\t--version\t\toutput the version number\n';
  message += '\t--repl\t\t\tallow REPL within console and on TCP port 1337\n';
  message += '\t--nolog\t\t\tconsole output will be suppressed\n';
  message += '\t--webserver\t\tensures webserver(s) are brought online\n';
  message += '\t--verbose\t\tDEBUG level console output\n';
  message += '\t--trace\t\tTRACE level console output\n';
  return message;
};

/**
 * Prints to the console the runtime usage instructions.
 * @return {string} the usage message
 */
cli.usage = function () {
  console.log(cli._message());
};

/**
 * Process the runtime arguments for different flags, for example `--version`.
 * The function returns a flag to indicate if execution should stop immediately after the function returns.
 * @return {bool} flag indicating if the runtime should stop execution
 */
cli.process = function () {
  var shouldExit = false;
  if (process.argv.indexOf('--version') > -1) {
    console.log('v' + joola.VERSION);
    shouldExit = true;
  }
  if (process.argv.indexOf('--help') > -1) {
    cli.usage();
    shouldExit = true;
  }
  /* istanbul ignore if */
  if (process.argv.indexOf('--webserver') > -1) {
    joola.options = joola.options || {};
    joola.options.webserver = true;
  }
  return shouldExit;
};