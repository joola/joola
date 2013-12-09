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
  async = require('async'),
  jsdox = require('jsdox'),
  mkdirp = require('mkdirp');

var docPath = path.join(__dirname, '../docs');
var libPath = path.join(__dirname, '../lib');
var wikiPath = path.join(__dirname, '../wiki');
var wikiCodePath = path.join(wikiPath, '/technical-documentation/code/');

var exclusions = [
  'sdk/bin/joola.io.js',
  'README.md'
];

function copyFile(source, target, cb) {
  var cbCalled = false;

  try {
    var rd = fs.createReadStream(source);
    rd.on("error", function (err) {
      done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
      done(err);
    });
    wr.on("close", function (ex) {
      done();
    });
    rd.pipe(wr);

    function done(err) {
      if (!cbCalled) {
        cb(err);
        cbCalled = true;
      }
    }
  }
  catch (ex) {
    cb(ex);
  }
}

var calls = [];
call = function (callback) {
  var files = wrench.readdirSyncRecursive(docPath);
  var counter = 0;
  files.forEach(function (file) {
    if ((file.substring(file.length - 3) == '.md' || file.substring(file.length - 4) == '.png') && exclusions.indexOf(file) == -1) {
      var targetDir = path.join(wikiPath, path.dirname(file));
      var filename;
      if (path.dirname(file) != '.')
        filename = file.replace(path.dirname(file), '');
      else
        filename = file;

      if (!fs.existsSync(targetDir)) {
        mkdirp.sync(targetDir);
      }

      console.info('Processing static doc [' + path.join(targetDir, filename) + ']');
      copyFile(path.join(docPath, file), path.join(targetDir, filename), function (err) {
        if (err)
          console.error(err);

        counter++;
        if (counter >= files.length)
          return callback(null);
      });
    }
  });
};
calls.push(call);

var call = function (callback) {
  var files = wrench.readdirSyncRecursive(libPath);
  var counter = 0;
  files.forEach(function (file) {
    if (file.substring(file.length - 3) == '.js' && exclusions.indexOf(file) == -1 && file.indexOf('webserver/public/') == -1) {
      var targetDir = path.join(wikiCodePath, path.dirname(file));
      if (!fs.existsSync(targetDir)) {
        mkdirp.sync(targetDir);
      }
      var filename = file.replace(path.dirname(file), '');
      if (filename.substring(0, 1) == '/')
        filename = filename.substring(1);
      filename = 'joola.lib.' + path.dirname(file).replace(/\//ig, '.') + '.' + filename.replace('.js', '.md');

      console.info('Processing doc [' + path.join(targetDir, filename) + ']');

      process.argv.fullpath = true;
      jsdox.generateForDir(path.join(libPath, file), targetDir + '/' + filename, function (err) {
        if (err)
          console.error(err);

        counter++;
        if (counter >= files.length)
          return callback(null);
      });
    }
  });
};

calls.push(call);

async.parallel(calls, function (err) {
  if (err)
    throw err;

  console.log('DONE');
});