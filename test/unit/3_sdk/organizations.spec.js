/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("sdk-organizations", function () {
	var _bypassToken, _store;

	before(function (done) {
		_bypassToken = joola.config.authentication.bypassToken;
		_store = joola.config.authentication.store;

		_sdk.TOKEN = '123';

		joola.config.set('authentication:store', 'bypass');
		joola.config.set('authentication:bypassToken', '123');

		joola.config.clear('authentication:organizations:test-org', function (err) {
			if (err)
				throw err;
			done();
		});
	});

	it("should add an organization", function (done) {
		var org = {
			name: 'test-org',
			filter: ''
		};
		_sdk.dispatch.organizations.add(org, function (err, _org) {
			if (err)
				return done(err);

			expect(_org).to.be.ok;
			done();
		});
	});

	it("should return a valid list of organizations", function (done) {
		_sdk.dispatch.organizations.list(function (err, orgs) {
			return done(err);
		});
	});

	it("should fail adding an existing organization", function (done) {
		var org = {
			name: 'test-org',
			filter: ''
		};
		_sdk.dispatch.organizations.add(org, function (err, _org) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should fail to add an organization with incomplete details", function (done) {
		var org = {

		};
		_sdk.dispatch.organizations.add(org, function (err, _org) {
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
		_sdk.dispatch.organizations.update(org, function (err, _org) {
			if (err)
				return done(err);
			expect(_org._filter).to.equal('test=test');
			return done();
		});
	});

	it("should apply filter on organization members", function (done) {
		var user = {
			username: 'tester',
			displayName: 'tester user',
			_password: '1234',
			_roles: ['user'],
			_filter: '',
			organization: 'test-org'
		};
		_sdk.dispatch.users.add(user, function (err, user) {
			if (err)
				return done(err);
			expect(user._filter).to.equal('test=test');
			return done(err);
		});
	});

	it("should delete an organization", function (done) {
		var org = {
			name: 'test-org'
		};
		_sdk.dispatch.organizations.delete(org, function (err) {
			if (err)
				return done(err);

			_sdk.dispatch.organizations.list(function (err, orgs) {
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

	it("should fail deleting a non existing organization", function (done) {
		var org = {
			name: 'test-org-notexist'
		};
		_sdk.dispatch.organizations.delete(org, function (err) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	after(function (done) {
		joola.config.set('authentication:store', _store);
		joola.config.set('authentication:bypassToken', _bypassToken);
		done();
	});
});