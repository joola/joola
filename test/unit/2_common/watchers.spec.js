/**
 *  joola
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

var sleep = require('sleep');

describe("common-watchers", function () {
  it("should monitor ELB", function (done) {
    joola_proxy.events.once('elb', function () {
      return done();
    });
    sleep.sleep(2);
  });

  it("should build EPS stats object", function (done) {
    joola_proxy.statistics = null;
    sleep.sleep(2);
    joola.system.version(function (err, version) {
      expect(joola_proxy.statistics).to.be.ok;
      done();
    });
  });
});