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

describe("sdk-roles", function () {
	var _bypassToken, _store;

	before(function (done) {
		_bypassToken = joola.config.authentication.bypassToken;
		_store = joola.config.authentication.store;

		_sdk.TOKEN = '123';

		joola.config.set('authentication:store', 'bypass');
		joola.config.set('authentication:bypassToken', '123');

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
		_sdk.dispatch.roles.add(role, function (err, _role) {
			if (err)
				return done(err);

			expect(_role).to.be.ok;
			done();
		});
	});

	it("should return a valid list of roles", function (done) {
		_sdk.dispatch.roles.list(function (err, roles) {
			return done(err);
		});
	});

	it("should fail adding an existing role", function (done) {
		var role = {
			name: 'test-role',
			permissions: []
		};
		_sdk.dispatch.roles.add(role, function (err, _role) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should fail to add a role with incomplete details", function (done) {
		var role = {
			name: 'test-role-missing-details'
		};
		_sdk.dispatch.roles.add(role, function (err, _role) {
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
		_sdk.dispatch.roles.update(role, function (err, _role) {
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
		_sdk.dispatch.roles.delete(role , function (err) {
			if (err)
				return done(err);

			_sdk.dispatch.roles.list(function (err, roles) {
				if (err)
					return done(err);

				console.log(roles);
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
		_sdk.dispatch.roles.delete(role, function (err) {
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