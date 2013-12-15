/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("api-organizations", function () {
	before(function (done) {
		joola.config.clear('authentication:organizations:test-org', function (err) {
			if (err)
				throw err;
			done();
		});
	});

	it("should add a data source", function (done) {
		var org = {
			name: 'test-org',
			filter: ''
		};
		joola.dispatch.organizations.add(org, function (err, _org) {
			if (err)
				return done(err);

			expect(_org).to.be.ok;
			done();
		});
	});

	it("should return a valid list of organizations", function (done) {
		joola.dispatch.organizations.list(function (err, orgs) {
			return done(err);
		});
	});

	it("should fail adding an existing organization", function (done) {
		var org = {
			name: 'test-org',
			filter: ''
		};
		joola.dispatch.organizations.add(org, function (err, _org) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should fail to add a data source with incomplete details", function (done) {
		var org = {

		};
		joola.dispatch.organizations.add(org, function (err, _org) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should update an organization", function (done) {
		var org = {
			name: 'test-org',
			_filter: 'test=test'
		};
		joola.dispatch.organizations.update(org, function (err, _org) {
			if (err)
				return done(err);
			expect(_org._filter).to.equal('test=test');
			done();
		});
	});

	it("should delete an organization", function (done) {
		var org= {
			name: 'test-org'
		};
		joola.dispatch.organizations.delete(org, function (err) {
			if (err)
				return done(err);

			joola.dispatch.organizations.list(function (err, orgs) {
				if (err)
					return done(err);

				var exist = _.filter(orgs, function (item) {
					return item.name == 'test-org';
				});
				try {
					expect(exist.length).to.equal(0);
					done();
				}
				catch (ex) {
					done(ex);
				}
			});
		});
	});

	it("should fail deleting a non existing datasource", function (done) {
		var org = {
			name: 'test-org-notexist'
		};
		joola.dispatch.organizations.delete(org, function (err) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});
});