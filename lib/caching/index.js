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

var caching = exports;

caching.init = function (callback) {
  caching.hook();
  return caching.validate(function (err, validated) {
    if (err)
      return callback(err);

    if (validated)
      joola.events.emit('caching:ready');

    return callback(null, validated);
  });
};

caching.hook = function () {
  fs.readdirSync(path.join(__dirname, './')).forEach(function (file) {
    if (file != 'index.js') {
      var module = require('./' + file);
      var modulename = file.replace('.js', '');
      caching[modulename] = module;
      joola.logger.trace('Added source caching module [' + modulename + '] from ' + file);
    }
  });
};

caching.validate = function (callback) {
  return callback(null);
};

caching.verify = function (callback) {

};

