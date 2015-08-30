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

describe("common-geoip", function () {
  it("should perform lookup when no package if found", function (done) {
    var result = joola_proxy.common.geoip.lookup('0.0.0.0');
    //expect(result).to.equal('0.0.0.0');
    return done();
  });
});