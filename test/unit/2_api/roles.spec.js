/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

var async = require('async');

describe("api-roles", function () {
	before(function (done) {
		var calls = [];

		var call = function (callback) {
			joola.config.clear('authentication:roles:tester-roles-filter', callback);
		};
		calls.push(call);
		call = function (callback) {
			joola.config.clear('authentication:roles:test-role', callback);
		};
		calls.push(call);

		async.parallel(calls, done);
	});

	it("should add a role", function (done) {
		var role = {
			name: 'test-role',
			permissions: []
		};
		joola.dispatch.roles.add(role, function (err, _role) {
			if (err)
				return done(err);

			expect(_role).to.be.ok;
			done();
		});
	});

	it("should return a valid list of roles", function (done) {
		joola.dispatch.roles.list(function (err, roles) {
			return done(err);
		});
	});

	it("should fail adding an existing role", function (done) {
		var role = {
			name: 'test-role',
			permissions: []
		};
		joola.dispatch.roles.add(role, function (err, _role) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should fail to add a role with incomplete details", function (done) {
		var role = {
			name: 'test-role-missing-details'
		};
		joola.dispatch.roles.add(role, function (err, _role) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should update a role", function (done) {
		var role = {
			name: 'test-role',
			permissions: ['access_system']
		};
		joola.dispatch.roles.update(role, function (err, _role) {
			if (err)
				return done(err);
			expect(_role.permissions.length).to.equal(1);
			done();
		});
	});

	it("should delete a role", function (done) {
		var role = {
			name: 'test-role'
		};
		joola.dispatch.roles.delete(role , function (err) {
			if (err)
				return done(err);

			joola.dispatch.roles.list(function (err, roles) {
				if (err)
					return done(err);

				var exist = _.filter(roles, function (item) {
					return item.name == 'test-role';
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

	it("should fail deleting a non existing role", function (done) {
		var role = {
			name: 'test-role-notexist'
		};
		joola.dispatch.roles.delete(role, function (err) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});
});