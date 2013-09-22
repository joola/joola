var joolaio = require('../../lib/joola.io');

"use strict";
describe("services", function () {
	before(function (done) {
		console = {};
		done();
	});

	it("should start a service", function (done) {
		this.timeout = 5000;
		joolaio.argv._.push('services');
		joolaio.argv._.push('start');
		joolaio.argv._.push('web');
		joolaio.start(function (err) {
			assert(err == null);
			done();
		})
	});
});