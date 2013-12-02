/**
 *  @title joola.io/lib/common/cli
 *  @overview Provides CLI functionality and management for the runtime.
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 *
 *
 **/

var cli = exports;

/**
 * Provides the usage template to return when using --help
 * @return {string} the usage message
 */
cli._message = function () {
  var version = require('../../package.json').version;

  var message = '\njoola.io version ' + version + '\n';
  message += 'http://joola.io\n';
  message += '\n';
  message += 'Usage: ' + 'joola.io [options]\n';
  message += '\n';
  message += 'Options:\n';
  message += '\n';
  message += '\t--help\t\t\toutput usage information\n';
  message += '\t--version\t\toutput the version number\n';
  message += '\t--repl\t\t\tallow REPL within console and on TCP port 1337\n';
  message += '\t--nolog\t\t\tconsole output will be suppressed\n';
  message += '\t--webserver\t\tensures webserver(s) are brought online\n';
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
  if (joola.config.get('version')) {
    console.log('v' + joola.VERSION);
    shouldExit = true;
  }
  if (joola.config.get('help')) {
    cli.usage();
    shouldExit = true;
  }
  if (joola.config.get('nolog')) {
    global.nolog = true;
  }

  return shouldExit;
};