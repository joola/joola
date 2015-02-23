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

describe("common-redis", function () {
  it("should create a valid redis object", function (done) {
    var Redis = require('../../../lib/common/redis');
    var redis = new Redis({
      dsn: 'redis://127.0.0.1'
    });
    expect(redis.address).to.equal('127.0.0.1:6379');
    return done();
  });
  
  it("should fail creating an invalid redis object", function (done) {
    var Redis = require('../../../lib/common/redis');
    var redis = new Redis();
    expect(redis.ready).to.equal(undefined);
    return done();
  });
});