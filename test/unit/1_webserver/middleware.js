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

describe("webserver-middleware", function () {
  it("should have a working status middleware", function (done) {
    request.get('http://localhost:40008/status', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it("should show a custom 404", function (done) {
    request.get('http://localhost:40008/doesnotexist.html', function (err, response, body) {
      assert(response.statusCode == 404 && body.indexOf('<!--FOR TEST - 404-->') > -1);
      done();
    });
  });

  it("should show a custom 500", function (done) {
    request.get('http://localhost:40008/createantesterror', function (err, response, body) {
      assert(response.statusCode == 500 && body.indexOf('<!--FOR TEST - 500-->') > -1);
      done();
    });
  });
});