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
	Browser = require('zombie'),
	browser = new Browser({silent: true});

describe("auth-middleware-static", function () {
	it("should return static content with no login issues", function (done) {
		browser.visit('http://localhost:40008/images/test.png', function () {
			expect(browser.text("title")).to.equal('Page not found');
			done();
		});
	});

	it("should return login page with no issues", function (done) {
		browser.visit('http://localhost:40008/login', function () {
			expect(browser.text("title")).to.equal('Login');
			done();
		});
	});

	it("should validate a token presented in querystring", function (done) {
		browser.visit('http://localhost:40008/test/action?token=1234', function () {
			var result = browser.text();
			result = JSON.parse(result);

			expect(result.debug.query_token).to.equal('1234');
			done();
		});
	});

	it("should validate a token presented in headers", function (done) {
		var options = {};
		options.headers = {'joolaio-token': '12345'};
		browser.visit('http://localhost:40008/test/action', options, function () {
			var result = browser.text();
			result = JSON.parse(result);

			expect(result.debug.header_token).to.equal('12345');
			done();
		});
	});

	it("should return 401 error if no token", function (done) {
		browser.visit('http://localhost:40008/test/action', function () {
			expect(browser.statusCode).to.equal(401);
			done();
		});
	});
});