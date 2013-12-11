/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

var
	Browser = require('zombie'),
	browser = new Browser({silent: true});

describe("auth", function () {
	it("should return static content with no login issues", function (done) {
		browser.visit('http://localhost:40008/images/test.png', function () {
			expect(browser.text("title")).to.equal('Page not found');
			done();
		});
	});

	it("should return login page with no issues", function (done) {
		browser.visit('http://localhost:40008/login', function () {
			expect(browser.text("title")).to.equal('Login');
			done();
		});
	});

	it("should validate a token presented in querystring", function (done) {
		browser.visit('http://localhost:40008/api/test/action?token=1234', function () {
			var result = browser.text();
			result = JSON.parse(result);

			expect(result.debug.query_token).to.equal('1234');
			done();
		});
	});

	it("should validate a token presented in headers", function (done) {
		var options = {};
		options.headers = {'joolaio-token': '12345'};
		browser.visit('http://localhost:40008/api/test/action', options, function () {
			var result = browser.text();
			result = JSON.parse(result);

			expect(result.debug.header_token).to.equal('12345');
			done();
		});
	});

	it("should return 401 error if no token", function (done) {
		browser.visit('http://localhost:40008/api/test/action', function () {
			expect(browser.statusCode).to.equal(401);
			done();
		});
	});

	it("should allow anonymous access", function (done) {
		var token = '123';
		var _store = joola.config.authentication.store;
		joola.config.authentication.store = 'anonymous';
		joola.auth.validateToken(token, function (err, token) {
			joola.config.authentication.store = _store;
			expect(token.user.username).to.equal('anonymous');
			done(err);
		});
	});

	it("should allow bypass access", function (done) {
		var token = '123';
		var _bypassToken = joola.config.authentication.bypassToken;
		var _store = joola.config.authentication.store;
		joola.config.authentication.store = 'internal';
		joola.config.authentication.bypassToken = '123';
		joola.auth.validateToken(token, function (err, token) {
			joola.config.authentication.store = _store;
			joola.config.authentication.bypassToken = _bypassToken;
			expect(token.user.username).to.equal('bypass');
			done(err);
		});
	});

	it("should generate a valid security token", function (done) {
		var user = {
			username: 'test'
		};
		joola.auth.generateToken(user, function (err, token) {
			expect(token._).to.be.ok;
			expect(token.user).to.be.ok;
			expect(token.timestamp).to.be.ok;
			expect(token.expires).to.be.ok;
			done(err);
		});
	});

	it("token should expire after 2 seconds", function (done) {
		var user = {
			username: 'test'
		};
		var _expireAfter = joola.config.authentication.tokens.expireAfter;
		joola.config.authentication.tokens.expireAfter = 2000;

		joola.auth.generateToken(user, function (err, token) {
			joola.config.authentication.tokens.expireAfter = _expireAfter;

			joola.auth.validateToken(token._, function (err, valid) {
				if (err)
					return done(err);
				expect(valid).to.be.ok;
				setTimeout(function () {
					joola.auth.validateToken(token._, function (err, valid) {
						expect(err).to.be.ok;
						done();
					});
				}, 2000);
			});
		});
	});

	it("should expire a token", function (done) {
		var user = {
			username: 'test'
		};
		joola.auth.generateToken(user, function (err, token) {
			joola.auth.expireToken(token, function (err) {
				joola.auth.validateToken(token, function (err, valid) {
					expect(err).to.be.ok;
					done();
				});
			});
		});
	});

	it("should prevent a expiration tempering", function (done) {
		var user = {
			username: 'test'
		};
		joola.auth.generateToken(user, function (err, token) {
			token.expires = new Date().getTime();
			joola.redis.hmset('auth:tokens:' + token._, token, function (err) {
				joola.auth.validateToken(token, function (err, valid) {
					expect(err).to.be.ok;
					done();
				});
			});
		});
	});

	it("should validate a route", function (done) {
		var modulename = 'datasources';
		var action = 'list';

		joola.auth.validateRoute(modulename, action, function (err, action) {
			expect(action).to.be.ok;
			done(err);
		});
	});

	it("should error on invalid a route", function (done) {
		var modulename = 'datasources2';
		var action = 'list';

		joola.auth.validateRoute(modulename, action, function (err, action) {
			if (!err) {
				return done(new Error('Failed'));
			}
			return done();
		});
	});

	it("should validate an action", function (done) {
		var modulename = 'datasources';
		var action = 'list';

		var user = {
			username: 'tester',
			_roles: ['admin']
		};
		var req = {
			params: {
			},
			user: user
		};
		var res = {};

		joola.auth.validateRoute(modulename, action, function (err, action) {
			if (err)
				return done(err);
			try {
				joola.auth.validateAction(action, req, res, function (err, valid) {
					return done(err);
				});
			}
			catch (ex) {
				return done(ex);
				//this is to ensure we don't have exceptions perculating back up and down.
			}
		});
	});

	it("should fail validating an action when no user", function (done) {
		var modulename = 'datasources';
		var action = 'list';

		var req = {
			params: {
			}
		};
		var res = {};

		joola.auth.validateRoute(modulename, action, function (err, action) {
			if (err)
				return done(err);
			try {
				joola.auth.validateAction(action, req, res, function (err, valid) {
					if (err)
						return done();
					return done(new Error('This should have failed'));
				});
			}
			catch (ex) {
				//this is to ensure we don't have exceptions perculating back up and down.
				return done(ex);
			}
		});
	});

	it("should fail validating an action when no permission", function (done) {
		var modulename = 'test';
		var action = 'nopermission';

		var user = {
			username: 'tester',
			_roles: ['user']
		};
		var req = {
			params: {
			},
			user: user
		};
		var res = {};

		joola.auth.validateRoute(modulename, action, function (err, action) {
			if (err)
				return done(err);
			try {
				joola.auth.validateAction(action, req, res, function (err, valid) {
					if (err)
						return done();
					return done(new Error('This should have failed'));
				});
			}
			catch (ex) {
				//this is to ensure we don't have exceptions perculating back up and down.
				return done(ex);
			}
		});
	});

	it("should validate an action when permission ok", function (done) {
		var modulename = 'test';
		var action = 'withpermission';

		var user = {
			username: 'tester',
			_roles: ['user']
		};
		var req = {
			params: {
			},
			user: user
		};
		var res = {};

		joola.auth.validateRoute(modulename, action, function (err, action) {
			if (err)
				return done(err);
			try {
				joola.auth.validateAction(action, req, res, function (err, valid) {
					if (err)
						return done(err);
					return done();
				});
			}
			catch (ex) {
				//this is to ensure we don't have exceptions perculating back up and down.
				return done(ex);
			}
		});
	});

});
