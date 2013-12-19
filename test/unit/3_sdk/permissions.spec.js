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

describe("sdk-permissions", function () {
	var _bypassToken, _store;

	before(function (done) {
		_bypassToken = joola.config.authentication.bypassToken;
		_store = joola.config.authentication.store;

		_sdk.TOKEN = '123';

		joola.config.set('authentication:store', 'bypass');
		joola.config.set('authentication:bypassToken', '123');

		var calls = [];
		var call = function (callback) {
			joola.config.clear('authentication:permissions:tester-permissions-filter', callback);
		};
		calls.push(call);
		call = function (callback) {
			joola.config.clear('authentication:permissions:test-permission', callback);
		};
		calls.push(call);
		async.parallel(calls, done);
	});

	it("should add a permission", function (done) {
		var permission = {
			name: 'test-permission'
		};
		_sdk.dispatch.permissions.add(permission, function (err, _permission) {
			if (err)
				return done(err);

			expect(_permission).to.be.ok;
			done();
		});
	});

	it("should return a valid list of permissions", function (done) {
		_sdk.dispatch.permissions.list(function (err, permissions) {
			return done(err);
		});
	});

	it("should fail adding an existing permission", function (done) {
		var permission = {
			name: 'test-permission'
		};
		_sdk.dispatch.permissions.add(permission, function (err, _permission) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should delete a permission", function (done) {
		var permission = {
			name: 'test-permission'
		};
		_sdk.dispatch.permissions.delete(permission , function (err) {
			if (err)
				return done(err);

			_sdk.dispatch.permissions.list(function (err, permissions) {
				if (err)
					return done(err);

				var exist = _.filter(permissions, function (item) {
					return item.name == 'test-permission';
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

	it("should fail deleting a non existing permission", function (done) {
		var permission = {
			name: 'test-permission-notexist'
		};
		_sdk.dispatch.permissions.delete(permission, function (err) {
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