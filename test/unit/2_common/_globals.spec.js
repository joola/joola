"use strict";
describe("common-globals", function () {
	it("should have sinon defined", function () {
		expect(sinon).to.be.ok;
	});

	it("should have expect defined", function () {
		expect(expect).to.be.ok;
	});

	it("should have underscore defined", function () {
		expect(_).to.be.ok;
	});

	it("should have joola defined", function () {
		expect(joola).to.be.ok;
	});

	it("should have joola.io defined", function () {
		expect(joolaio).to.be.ok;
	});
});