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

describe("common-mixin", function () {
	it("should mixin", function () {
		var expected = {
			test1: 1,
			test2: 2
		};
		var actual = joola.common.mixin({}, expected);
		assert(actual.test1 && actual.test2);
	});

	it("should mixin - no overwrite", function () {
		var expected = {
			test1: 3,
			test2: 2
		};
		var actual = joola.common.mixin({test1: 1}, expected);
		expect(actual.test1).to.equal(1);
	});

	it("should mixin - overwrite", function () {
		var expected = {
			test1: 3,
			test2: 2
		};
		var actual = joola.common.mixin({test1: 1}, expected, true);
		expect(actual.test1).to.equal(3);
	});

	it("should return when add is not an object", function () {
		var expected = {
			test1: 3,
			test2: 2
		};
		var actual = joola.common.mixin(expected);
		expect(actual).to.equal(expected);
	});
});