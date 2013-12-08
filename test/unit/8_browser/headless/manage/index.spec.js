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

describe('browser-manage-index', function () {
  it('should load the index page', function (done) {
    browser.visit("http://localhost:" + joola.config.interfaces.webserver.port + '/manage/index', function () {
      expect(browser.text("title")).to.equal('joola.io Management Portal');
      done();
    });
  });

  it('should load the 404 page', function (done) {
    browser.visit("http://localhost:" + joola.config.interfaces.webserver.port + '/manage/index2', function () {
      expect(browser.text("title")).to.equal('Page not found');
      done();
    });
  });

  it('check that we have a valid username', function (done) {
    browser.visit("http://localhost:" + joola.config.interfaces.webserver.port + '/manage/index', function () {
      var expected = 'USERNAME';
      var actual = browser.text('.btn.dropdown-toggle');
      expect(actual).to.equal(expected);
      done();
    });
  });
});