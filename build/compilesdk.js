var
  fs = require('fs'),
  path = require('path'),
  spawn = require('child_process').spawn,
  browserify = spawn('browserify', [path.join(__dirname, '../lib/sdk/browser.js'), '-i', path.join(__dirname, '../lib/sdk/bin/joola.io.js'), '-o', path.join(__dirname, '../lib/sdk/bin/joola.io.js')]);

var buffer = '';
browserify.stdout.on('data', function (data) {
  buffer += data;
  console.log(data);
});

browserify.stderr.on('data', function (data) {
  throw data;
});

browserify.on('close', function (code) {
  console.log('File compiled');
});
