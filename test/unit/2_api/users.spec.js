/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("api-users", function () {
	before(function (done) {
		joola.config.clear('authentication:users:tester', function (err) {
			if (err)
				return done(err);
			return done();
		});
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
			username: 'tester'
		};
		joola.dispatch.users.add(user, function (err, user) {
			return done(err);
		});
	});

	it("should get a user by username", function (done) {
		var username = 'tester';
		joola.dispatch.users.get(username, function (err, user) {
			expect(user).to.be.ok;
			expect(user.username).to.equal('tester');
			return done(err);
		});
	});

	it("should fail adding a user with an already existing username", function (done) {
		var user = {
			username: 'tester'
		};
		joola.dispatch.users.add(user, function (err, user) {
			if (err)
				return done();
			return done(new Error('This should fail.'));
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
});