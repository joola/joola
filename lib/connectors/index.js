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

var
  path = require('path'),
  fs = require('fs');

var connectors = exports;

joola.events.on('dispatch:ready', function () {
  fs.readdirSync(path.join(__dirname, './')).forEach(function (file) {
    if (file != 'index.js') {
      var module = require('./' + file);
      var modulename = file.replace('.js', '');
      connectors[modulename] = module;
      joola.logger.trace('Added source data connector [' + modulename + '] from ' + file);
    }
  });
  joola.events.emit('connectors:ready');
});