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
  path = require('path');
"use strict";
describe("cli-arguments", function () {
  var packageFile = path.join(__dirname, '../../../', 'package.json');
  var version = require(packageFile).version;

  it("should printout version number [" + version + "]", function (done) {
    var spawn = require('child_process').spawn;
    var binPath = path.join(__dirname, '../../../', 'joola.io.js');
    var app = spawn('node', [binPath, "--version"]);

    var buffer = '';
    app.stdout.on('data', function (data) {
      buffer += data;
    });

    app.stderr.on('data', function (data) {
      throw data;
    });

    app.on('close', function (code) {
      if (code != 0)
        throw new Error('Failed to spawn node, code: ' + code);

      expect(buffer).to.equal('v' + version + '\n');
      done();
    });
  });

  it("should print out usage correctly", function (done) {
    var spawn = require('child_process').spawn;
    var binPath = path.join(__dirname, '../../../', 'joola.io.js');
    var app = spawn('node', [binPath, "--help"]);

    var buffer = '';
    app.stdout.on('data', function (data) {
      buffer += data;
    });

    app.stderr.on('data', function (data) {
      throw data;
    });

    app.on('close', function (code) {
      if (code != 0)
        throw new Error('Failed to spawn node, code: ' + code);

      var message = require('../../../lib/common/usage')._message()
      expect(buffer).to.equal(message + '\n');
      done();
    });
  });

  it("should start REPL", function (done) {
    this.timeout(15000);
    try {
      var spawn = require('child_process').spawn;
      var binPath = path.join(__dirname, '../../../', 'joola.io.js');
      var app = spawn('node', [binPath, '--repl']);

      var buffer = '';
      app.stdout.on('data', function (data) {
        buffer += data;
      });

      app.stderr.on('data', function (data) {
        console.log(data.toString('utf8'));
      });

      setTimeout(function () {
        var net = require('net');
        var sock = net.connect(1337);

        sock.on('connect', function () {
          var buffer = new Buffer('shutdown();\n');
          sock.end(buffer);
        });
      }, 1000);

      app.on('close', function (code) {
        expect(code).to.equal(0);
        done();
      });
    }
    catch (ex) {
      console.log(ex);
    }
  });
});