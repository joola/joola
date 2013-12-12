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

describe("api-users", function () {
	before(function (done) {
		var calls = [];

		var call = function (callback) {
			joola.config.clear('authentication:users:tester', callback);
		};
		calls.push(call);
		call = function (callback) {
			joola.config.clear('authentication:users:tester1', callback);
		};
		calls.push(call);
		call = function (callback) {
			joola.config.clear('authentication:users:tester-password', callback);
		};
		calls.push(call);
		async.parallel(calls, done);
	});

	it("should have a valid users dispatch", function (done) {
		expect(joola.dispatch.users).to.be.ok;
		return done();
	});

	it("should list all available users", function (done) {
		joola.dispatch.users.list(function (err, users) {
			return done(err);
		});
	});

	it("should add a user", function (done) {
		var user = {
			username: 'tester',
			displayName: 'tester user',
			_password: '1234',
			_roles: ['user'],
			_filter: ''
		};
		joola.dispatch.users.add(user, function (err, user) {
			return done(err);
		});
	});

	it("should fail adding a user with incomplete details", function (done) {
		var user = {
			username: 'tester2'
		};
		joola.dispatch.users.add(user, function (err, user) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should encrypt a user password", function (done) {
		var user = {
			username: 'tester-password',
			displayName: 'tester user',
			_password: '1234',
			_roles: ['user'],
			_filter: ''
		};
		joola.dispatch.users.add(user, function (err, user) {
			if (err)
				return done(err);

			expect(user._password).to.not.equal('1234');
			return done();
		});
	});

	it("should get a user by username", function (done) {
		var username = 'tester';
		joola.dispatch.users.get(username, function (err, user) {
			if (err)
				return done(err);
			expect(user).to.be.ok;
			expect(user.username).to.equal('tester');
			return done();
		});
	});

	it("should fail adding a user with an already existing username", function (done) {
		var user = {
			username: 'tester',
			displayName: 'tester user',
			_password: '1234',
			_roles: ['user'],
			_filter: ''
		};
		joola.dispatch.users.add(user, function (err, user) {
			if (err)
				return done();
			return done(new Error('This should fail.'));
		});
	});

	it("should update a user", function (done) {
		var user = {
			username: 'tester1',
			displayName: 'testing user',
			_password: '1234',
			_roles: ['user'],
			_filter: ''
		};
		joola.dispatch.users.add(user, function (err, user) {
			if (err)
				return done(err);
			user.displayName = 'testing user with change';
			joola.dispatch.users.update(user, function (err, user) {
				if (err)
					return done(err);

				joola.dispatch.users.get(user.username, function (err, _user) {
					if (err)
						return done(err);
					expect(_user).to.be.ok;
					expect(_user.displayName).to.equal('testing user');
					return done();
				});
			});
		});
	});

	it("should fail updating a non existing user", function (done) {
		var user = {
			username: 'tester2',
			displayName: 'tester user',
			_password: '1234',
			_roles: ['user'],
			_filter: ''
		};
		joola.dispatch.users.update(user, function (err, user) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should delete a user", function (done) {
		var user = {
			username: 'tester'
		};
		joola.dispatch.users.delete(user, function (err, user) {
			if (err)
				return done(err);
			joola.dispatch.users.list(function (err, users) {
				if (users[user.username])
					return done('This should fail');
				else
					return done(err);
			});
		});
	});

	it("should hash passwords correctly", function (done) {
		var hashOK = joola.dispatch.users.hashPassword('password') != 'password';
		expect(hashOK).to.equal(true);
		return done();
	});
});