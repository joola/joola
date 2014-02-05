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
  path = require('path'),
  request = require('request');

describe("webserver", function () {
  it("should have HTTP port open", function (done) {
    request.get('http://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.port + '', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it("should have HTTPS port open", function (done) {
    request.get('https://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.securePort + '', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it("should show a custom 404", function (done) {
    request.get('http://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.port + '/doesnotexist.html', function (err, response, body) {
      assert(response.statusCode == 404 && body.indexOf('<!--FOR TEST - 404-->') > -1);
      done();
    });
  });

  it("should show a custom 500", function (done) {
    request.get('http://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.port + '/api/test/createtesterror', function (err, response, body) {
      assert(response.statusCode == 500);
      done();
    });
  });
});