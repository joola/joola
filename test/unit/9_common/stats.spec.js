/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

describe("stats", function () {

  it("should have a valid stats object", function () {
    expect(joola.stats).to.be.ok;
  });

  it("should increment a test event", function (done) {
    joola.redis.del('stats:events:test-suite', function (err) {
      if (err)
        return done(err);

      joola.stats.incr('test-suite', function (err, value) {
        expect(value).to.equal(1);
        done();
      });
    });
  });

  it("should emit stats", function (done) {
    var _interval = joola.stats.emitInterval;
    joola.stats.emitInterval = 1000;
    setTimeout(function () {
      joola.events.once('stats:events', function (message) {
        joola.stats.emitInterval = _interval;
        expect(message).to.be.ok;
        done();
      });

      setTimeout(function () {
        joola.stats.emitInterval = _interval;
        done(new Error('Failed to wait on emit'));
      }, 2000);
    }, _interval + 100);
  });
});