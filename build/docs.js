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
  wrench = require('wrench'),
  path = require('path'),
  fs = require('fs'),
  jsdox = require('jsdox');

var basePath = path.join(__dirname, '../lib');
var wikiPath = path.join(__dirname, '../wiki');
var exclusions = [
  'sdk/bin/joola.io.js'
];

var files = wrench.readdirSyncRecursive(basePath);

files.forEach(function (file) {
  if (file.substring(file.length - 3) == '.js' && exclusions.indexOf(file) == -1) {
    var targetDir = path.join(wikiPath, path.dirname(file));
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }

    var targetFile = path.join(wikiPath, file.replace('.js', '.md'));
    jsdox.generateForDir(path.join(basePath, file), targetDir, function () {
      console.log('Processed docs for: ' + path.join(targetDir, file.replace('.js', '.md')));
    });
  }
});
