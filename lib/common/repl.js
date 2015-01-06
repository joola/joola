/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  joola = require('../joola'),

  net = require('net'),
  repl = require('repl');

var _repl = repl.start({
  prompt: "",
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  useGlobal: true,
  ignoreUndefined: false,
  eval: function (cmd, context, filename, callback) {
    var result;
    try {
      result = eval(cmd);
      callback(null, result);
    }
    catch (ex) {
      callback(new Error('Failed to execute EVAL: ' + ex.message));
    }
  }
});
_repl.context.shutdown = joola.shutdown;

require('repl.history')(_repl, process.env.HOME + '/.joola_repl_history');
joola.logger.info('REPL interface available, type commands in the console or via TCP [' + joola.config.get('interfaces:repl:port') + '].');
net.createServer(function (socket) {
  var _repl_net = repl.start({
    prompt: 'joola ' + socket.remoteAddress + ':' + socket.remotePort + '> ',
    input: socket,
    output: socket,
    terminal: true,
    useGlobal: true,
    ignoreUndefined: false
  });
  _repl_net.on('exit', function () {
    joola.logger.debug('REPL connection ' + socket.remoteAddress + ':' + socket.remotePort + ' closed.');
    socket.end();
  });
  socket.on('close', function () {
    joola.logger.debug('REPL connection terminated.');
  });
}).listen(joola.config.get('interfaces:repl:port'), '127.0.0.1', function (err) {
  if (err)
    throw err;

  joola.logger.debug('REPL started on port [' + joola.config.get('interfaces:repl:port') + ']');
});
