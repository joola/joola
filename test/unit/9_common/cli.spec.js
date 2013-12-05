/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


"use strict";

var
  path = require('path');

describe("common-cli-arguments", function () {
  var packageFile = path.join(__dirname, '../../../', 'package.json');
  var version = require(packageFile).version;

  it("should printout version number [" + version + "]", function (done) {
    var spawn = require('child_process').spawn;
    var binPath = path.join(__dirname, '../../../', 'joola.io.js');
    var app = spawn('node', [binPath, '--version', '--nolog']);

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
    var app = spawn('node', [binPath, '--help', '--nolog']);

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

      var message = require('../../../lib/common/cli')._message()
      expect(buffer).to.equal(message + '\n');
      done();
    });
  });

  it("should start REPL", function (done) {
    this.timeout(15000);
    try {
      var spawn = require('child_process').spawn;
      var binPath = path.join(__dirname, '../../../', 'joola.io.js');
      var app = spawn('node', [binPath, '--repl', '--nolog']);

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
        //expect(code).to.equal(0);
        done();
      });
    }
    catch (ex) {
      console.log(ex);
    }
  });

  it("code: usage()", function (done) {
    var cli = require('../../../lib/common/cli');
    var actual = '';
    var unhook = hook_stdout(function (string) {
      actual += string;
    });
    cli.usage();
    unhook();
    var expected = cli._message();
    expected += '\n';
    expect(actual).to.equal(expected);
    done();
  });

  it("code: process() true for shouldExit (version, help)", function (done) {
    var cli = require('../../../lib/common/cli');
    var actual = '';
    var unhook = hook_stdout(function (string) {
      actual += string;
    });

    process.argv.push('--version') ;
    var shouldExit = cli.process();
    process.argv.splice(process.argv.length-1);
    var expected = true;
    expect(shouldExit).to.equal(expected);

    process.argv.push('--help');
    var shouldExit = cli.process();
    process.argv.splice(process.argv.length-1);
    var expected = true;
    expect(shouldExit).to.equal(expected);

    unhook();
    done();
  });

  it("code: process() true for shouldExit (nolog)", function (done) {
    var cli = require('../../../lib/common/cli');
    var actual = '';
    var unhook = hook_stdout(function (string) {
      actual += string;
    });

    process.argv.push('--nolog');
    var shouldExit = cli.process();
    var expected = false;
    expect(shouldExit).to.equal(expected);
    process.argv.splice(process.argv.length-1);

    unhook();
    done();
  });
});