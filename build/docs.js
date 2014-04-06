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
  var expected = files.length;
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

      //console.info('Processing static doc [' + path.join(targetDir, filename) + ']');
      copyFile(path.join(docPath, file), path.join(targetDir, filename), function (err) {
        if (err)
          console.error(err);

        counter++;
        if (counter >= expected) {
          return callback(null);
        }
      });
    }
    else
      expected--;
  });
};
calls.push(call);

var call = function (callback) {
  var files = wrench.readdirSyncRecursive(libPath);
  var counter = 0;
  var expected = files.length;
  files.forEach(function (file) {
    if (file.substring(file.length - 3) == '.js' && exclusions.indexOf(file) == -1 && file.indexOf('webserver/public/') == -1) {
      var targetDir = path.join(wikiCodePath, path.dirname(file));
      if (!fs.existsSync(targetDir)) {
        mkdirp.sync(targetDir);
      }
      var filename = file.replace(path.dirname(file), '');
      if (filename.substring(0, 1) == '/')
        filename = filename.substring(1);
      filename = 'lib\\' + path.dirname(file).replace(/\//ig, '\\') + '\\' + filename.replace('.js', '') + ' (jsdoc).md';

      //console.info('Processing doc [' + path.join(targetDir, filename) + ']');

      process.argv.fullpath = true;
      jsdox.generateForDir(path.join(libPath, file), targetDir + '/' + filename, function (err) {
        if (err)
          console.error(err);

        var stamp = '<a name="top" />\r\n\r\n[HOME](Home) > [[TECHNICAL DOCUMENTATION]] > [[CODE DOCUMENTATION]] > **' + filename.replace(' (jsdoc).md', '') + '**';
        try {
          var data = fs.readFileSync(path.join(targetDir, filename));
          data = stamp + '\r\n\r\n' + data;
          fs.writeFileSync(path.join(targetDir, filename), data);
        }
        catch (ex) {
        }
        counter++;
        if (counter >= expected) {
          return callback(null);
        }
      });
    }
    else
      expected--;
  });
};

calls.push(call);
async.series(calls, function (err) {
  if (err) {
    throw err;
  }

  var output = '';
  var common = '';
  var dirs = fs.readdirSync(libPath);
  dirs.forEach(function (dir) {
    var _dir = path.join(libPath, dir);
    if (fs.lstatSync(_dir).isDirectory()) {

      var data = fs.readFileSync(path.join(_dir, 'README.md'));
      output += '#### ' + dir + '\r\n';
      //_dir.indexOf('lib/common') > -1 ? common += '#### ' + dir + '\r\n' : null;
      output += data + '\r\n\r\n';
      //_dir.indexOf('lib/common') > -1 ? common += data + '\r\n\r\n' : null;

      var counter = 0;
      var files = fs.readdirSync(_dir);
      files.forEach(function (file) {
        var _file = path.join(_dir, file);
        if (fs.lstatSync(_file).isFile()) {
          if (path.extname(_file) == '.js') {
            var modulename = path.basename(_file, '.js');
            if (counter % 8 == 0){
              output += '\r\n\r\n';
              _dir.indexOf('lib/common') > -1 ? common += '\r\n\r\n' : null;
            }
            output += '<code><a href="' + 'lib\\' + dir + '\\' + modulename + ' (jsdoc)">' + modulename + '</a></code>';
            _dir.indexOf('lib/common') > -1 ? common += '<code><a href="' + 'lib\\' + dir + '\\' + modulename + ' (jsdoc)">' + modulename + '</a></code>' : null;
            counter++;
          }
        }
      });
      output += '\r\n\r\n';
    }
  });

  var data = fs.readFileSync(path.join(wikiCodePath, 'Code-documentation.md')).toString();
  data = data.replace('[##INSERTSTRUCTURE##]', output);
  fs.writeFileSync(path.join(wikiCodePath, 'Code-documentation.md'), data);

  var data = fs.readFileSync(path.join(wikiCodePath, '/../architecture/The-Common-Subsystem.md')).toString();
  data = data.replace('[##INSERTSTRUCTURE_COMMON##]', common);
  fs.writeFileSync(path.join(wikiCodePath, '/../architecture/The-Common-Subsystem.md'), data);

});

