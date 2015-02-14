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
    var redis = new Redis();
    expect(redis).to.be.ok;
    return done();
  });
});