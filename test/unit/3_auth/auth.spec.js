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
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = global.uid;
    this.workspace = _token.user.workspace;
    return done();
  });

  it("should return static content with no login issues", function (done) {
    browser.visit('http://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.port + '/ico/favicon.ico', function () {
      expect(browser.success).to.equal(true);
      return done();
    });
  });

  it("should generate a valid security token", function (done) {
    var user = {
      username: 'test',
      password: 'password',
      roles: [],
      workspace: this.workspace
    };
    joola.auth.generateToken(user, function (err, token) {
      if (err)
        return done(err);
      expect(token._).to.be.ok;
      expect(token.user).to.be.ok;
      expect(token.timestamp).to.be.ok;
      expect(token.expires).to.be.ok;
      done(err);
    });
  });

  xit("token should expire after 2 seconds", function (done) {
    var user = {
      username: 'test',
      password: 'password',
      roles: [],
      workspace: this.workspace
    };
    var _expireAfter = joola.config.authentication.tokens.expireAfter;
    joola.config.authentication.tokens.expireAfter = 2000;

    joola.auth.generateToken(user, function (err, token) {
      joola.config.authentication.tokens.expireAfter = _expireAfter;

      joola.auth.validateToken(token._, null, function (err, valid) {
        if (err)
          return done(err);
        expect(valid).to.be.ok;
        setTimeout(function () {
          joola.auth.validateToken(token._, null, function (err, valid) {
            if (err)
              done();
            else
              done(new Error('Failed to expire token'));
          });
        }, 2000);
      });
    });
  });

  it("should expire a token", function (done) {
    var user = {
      username: 'test',
      password: 'password',
      roles: [],
      workspace: this.workspace
    };
    joola.auth.generateToken(user, function (err, token) {
      if (err)
        return done(err);
      joola.auth.expireToken(token, function (err) {
        if (err)
          return done(err);
        joola.auth.validateToken(token, null, function (err, valid) {
          if (err)
            return done();

          return done(new Error('Expected this to fail'));
        });
      });
    });
  });

  it("should validate a route", function (done) {
    var modulename = 'collections';
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
    var modulename = 'collections';
    var action = 'list';

    var user = {
      username: 'tester',
      roles: ['root'],
      workspace: '_test'
    };
    var req = {
      params: {
        workspace: '_test'
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
    var modulename = 'collections';
    var action = 'list';

    var req = {
      params: {
        workspace: '_test'
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
      roles: ['user'],
      workspace: '_test'
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
      roles: ['root'],
      workspace: '_test'
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

  it("should encrypt a user password", function (done) {
    var password = '1234';
    var hash = joola.auth.hashPassword(password);
    expect(hash).to.not.equal('1234');
    done();
  });

  it("should store salt with the hash", function (done) {
    var password = '1234';
    var hash = joola.auth.hashPassword(password);

    assert(hash.indexOf('$') > -1);
    done();
  });

  it("should validate a password", function (done) {
    var password = '1234';
    var hash = 'nVHqYEJbh$81dc9bdb52d04dc20036dbd8313ed055';
    var valid = joola.auth.validatePassword(password, hash);

    assert(valid);
    done();
  });

  it("should get a user by token", function (done) {
    var user = {
      username: 'test-' + joola.common.uuid(),
      password: '1234',
      roles: ['user'],
      workspace: 'test-org'
    };
    joola.dispatch.users.add(this.context, this.workspace, user, function (err, _user) {
      joola.auth.generateToken(user, function (err, token) {
        if (err)
          return done(err);

        joola.auth.getUserByToken(token._, function (err, _user) {
          if (err)
            return done(err);

          expect(_user.username).to.equal(user.username);
          done(null);
        });
      });
    });
  });
});
