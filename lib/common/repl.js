/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var
  net = require('net'),
  repl = require('repl');

repl.start({
  prompt: "",
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  useGlobal: true,
  ignoreUndefined: false
});
joola.logger.info('REPL interface available, type commands in the console or via TCP (1337).');

net.createServer(function (socket) {
  var r = repl.start({
    prompt: 'joola.io ' + socket.remoteAddress + ':' + socket.remotePort + '> ',
    input: socket,
    output: socket,
    terminal: true,
    useGlobal: true,
    ignoreUndefined: false
  });
  r.on('exit', function () {
    joola.logger.debug('REPL connection ' + socket.remoteAddress + ':' + socket.remotePort + ' closed.');
    socket.end();
  });
  socket.on('close', function () {
    joola.logger.debug('REPL connection terminated.');
  });
}).listen(1337, '127.0.0.1', function (err) {
    if (err)
      throw err;

    joola.logger.debug('REPL started on port 1337');
  });
