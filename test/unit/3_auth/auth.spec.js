/**
 *  joola
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

  it("should generate a valid security token", function (done) {
    var user = {
      username: 'test',
      password: 'password',
      roles: ['user'],
      workspace: this.workspace
    };
    engine.auth.generateToken(user, function (err, token) {
      if (err)
        return done(err);
      expect(token._).to.be.ok;
      expect(token.user).to.be.ok;
      expect(token.timestamp).to.be.ok;
      expect(token.expires).to.be.ok;

      return done();
    });
  });


  it("should validate a token", function (done) {
    var user = {
      username: 'test',
      password: 'password',
      roles: ['user'],
      workspace: this.workspace
    };
    engine.auth.generateToken(user, function (err, token) {
      if (err)
        return done(err);

      engine.auth.validateToken(token._, null, function (err, valid) {
        if (err)
          return done(err);
        return done();
      });
    });
  });

  it("should fail generating a token on invalid user", function (done) {
    engine.auth.generateToken(null, function (err, token) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });

  it("should fail generating a token on invalid user", function (done) {
    engine.auth.generateToken('test', function (err, token) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });

  it("token should expire after 2 seconds", function (done) {
    var user = {
      username: 'test',
      password: 'password',
      roles: ['user'],
      workspace: this.workspace
    };
    var _expireafter = engine.config.authentication.tokens.expireafter;
    engine.config.set('authentication:tokens:expireafter', 1000);
    engine.auth.generateToken(user, function (err, token) {
      engine.auth.validateToken(token._, null, function (err, valid) {
        if (err)
          return done(err);
        expect(valid).to.be.ok;
        engine.config.set('authentication:tokens:expireafter', _expireafter);
        setTimeout(function () {
          engine.auth.validateToken(token._, null, function (err, valid) {
            if (err)
              done();
            else
              done(new Error('Failed to expire token'));
          });
        }, 2000);
      });
    });
  });

  it("token should not validate an invalid token", function (done) {
    engine.auth.validateToken(null, null, function (err, valid) {
      if (err)
        return done();
      return done(new Error('This should fail'));
    });
  });


  it("should use cached tokens", function (done) {
    var user = {
      username: 'test',
      password: 'password',
      roles: ['user'],
      workspace: this.workspace
    };
    engine.auth.generateToken(user, function (err, token) {
      if (err)
        return done(err);
      engine.auth.validateToken(token._, null, function (err, valid) {
        if (err)
          return done(err);
        expect(valid.cached).to.be.true;
        done();
      });
    });
  });

  it("should expire a token", function (done) {
    var user = {
      username: 'test',
      password: 'password',
      roles: ['user'],
      workspace: this.workspace
    };
    engine.auth.generateToken(user, function (err, token) {
      if (err)
        return done(err);
      engine.auth.expireToken(token, function (err) {
        if (err)
          return done(err);
        engine.auth.validateToken(token, null, function (err, valid) {
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

    engine.auth.validateRoute(modulename, action, function (err, action) {
      expect(action).to.be.ok;
      done(err);
    });
  });

  it("should error on invalid a route", function (done) {
    var modulename = 'datasources2';
    var action = 'list';

    engine.auth.validateRoute(modulename, action, function (err, action) {
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

    engine.auth.validateRoute(modulename, action, function (err, action) {
      if (err)
        return done(err);
      try {
        engine.auth.validateAction(action, req, res, function (err, valid) {
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

    engine.auth.validateRoute(modulename, action, function (err, action) {
      if (err)
        return done(err);
      try {
        engine.auth.validateAction(action, req, res, function (err, valid) {
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
      params: {},
      user: user
    };
    var res = {};

    engine.auth.validateRoute(modulename, action, function (err, action) {
      if (err)
        return done(err);
      try {
        engine.auth.validateAction(action, req, res, function (err, valid) {
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
      params: {},
      user: user
    };
    var res = {};

    engine.auth.validateRoute(modulename, action, function (err, action) {
      if (err)
        return done(err);
      try {
        engine.auth.validateAction(action, req, res, function (err, valid) {
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
    var hash = engine.auth.hashPassword(password);
    expect(hash).to.not.equal('1234');
    done();
  });

  it("should store salt with the hash", function (done) {
    var password = '1234';
    var hash = engine.auth.hashPassword(password);

    assert(hash.indexOf('$') > -1);
    done();
  });

  it("should fail hashing invalid input", function (done) {
    var hash = engine.auth.hashPassword(null);

    assert(!hash);
    done();
  });

  it("should validate a password", function (done) {
    var password = '1234';
    var hash = 'nVHqYEJbh$81dc9bdb52d04dc20036dbd8313ed055';
    var valid = engine.auth.validatePassword(password, hash);

    assert(valid);
    done();
  });

  it("should fail validating an invalid password (no password)", function (done) {
    var password = null;
    var hash = 'nVHqYEJbh$81dc9bdb52d04dc20036dbd8313ed055';
    var valid = engine.auth.validatePassword(password, hash);

    assert(!valid);
    done();
  });

  it("should fail validating an invalid password (no password)", function (done) {
    var password = '1234';
    var hash = null;
    var valid = engine.auth.validatePassword(password, hash);

    assert(!valid);
    done();
  });

  it("should get a user by token", function (done) {
    var user = {
      username: 'test-' + engine.common.uuid(),
      password: '1234',
      roles: ['user'],
      workspace: 'test-org'
    };
    engine.dispatch.users.add(this.context, this.workspace, user, function (err, _user) {
      engine.auth.generateToken(user, function (err, token) {
        if (err)
          return done(err);

        engine.auth.getUserByToken(token._, function (err, _user) {
          if (err)
            return done(err);

          expect(_user.username).to.equal(user.username);
          done(null);
        });
      });
    });
  });

  it("should fail get a user by non existing token", function (done) {
    engine.auth.getUserByToken('no such token', function (err, _user) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });

  it("should fail get a user by invalid token", function (done) {
    engine.auth.getUserByToken(null, function (err, _user) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });

  it("should generate an authentication error object", function (done) {
    var obj = new joola_proxy.auth.AuthErrorTemplate(new Error('Test'));
    expect(obj).to.be.ok;
    done();
  });

});
