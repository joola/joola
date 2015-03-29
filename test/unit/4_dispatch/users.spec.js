/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/
var async = require('async');

describe("users", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    this.workspace = _token.user.workspace;
    return done();
  });

  it("should have a valid users dispatch", function (done) {
    expect(engine.users).to.be.ok;
    return done();
  });

  it("should list all available users", function (done) {
    engine.users.list(this.context, this.workspace, function (err, users) {
      return done(err);
    });
  });

  it("should add a user", function (done) {
    var user = {
      username: 'tester-' + this.uid,
      displayName: 'tester user',
      password: '1234',
      roles: ['user'],
      filter: '',
      workspace: this.workspace
    };
    engine.users.add(this.context, this.workspace, user, function (err, user) {
      return done(err);
    });
  });

  it("should fail adding a user with incomplete details", function (done) {
    var user = {
      username: 'tester2'
    };
    engine.users.add(this.context, this.workspace, user, function (err, user) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail adding a user with no roles", function (done) {
    var user = {
      username: 'tester-noroles-' + this.uid,
      displayName: 'tester user',
      password: '1234',
      filter: '',
      workspace: this.workspace
    };
    engine.users.add(this.context, this.workspace, user, function (err, user) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail adding a user with empty roles", function (done) {
    var user = {
      username: 'tester-noroles-' + this.uid,
      displayName: 'tester user',
      password: '1234',
      roles: [],
      filter: '',
      workspace: this.workspace
    };
    engine.users.add(this.context, this.workspace, user, function (err, user) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail adding a user with non-existant roles", function (done) {
    var user = {
      username: 'tester-noroles-' + this.uid,
      displayName: 'tester user',
      password: '1234',
      roles: ['user2'],
      filter: '',
      workspace: this.workspace
    };
    engine.users.add(this.context, this.workspace, user, function (err, user) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should get a user by username", function (done) {
    var username = 'tester-' + this.uid;
    var self = this;
    engine.users.get(this.context, this.workspace, username, function (err, user) {
      if (err)
        return done(err);
      expect(user).to.be.ok;
      expect(user.username).to.equal('tester-' + self.uid);
      return done();
    });
  });
  
  it("should fail adding a user with an already existing username", function (done) {
    var user = {
      username: 'tester-' + this.uid,
      displayName: 'tester user',
      password: '1234',
      roles: ['user'],
      filter: '',
      workspace: this.workspace
    };
    engine.users.add(this.context, this.workspace, user, function (err, user) {
      if (err)
        return done();
      return done(new Error('This should fail.'));
    });
  });

  it("should update a user", function (done) {
    var self = this;
    var user = {
      username: 'tester-' + this.uid,
      displayName: 'testing user',
      password: '1234',
      roles: ['user'],
      filter: '',
      workspace: this.workspace
    };
    user.displayName = 'testing user with change';
    engine.users.patch(self.context, self.workspace, user.username, user, function (err) {
      if (err)
        return done(err);

      engine.users.get(self.context, self.workspace, user.username, function (err, _user) {
        if (err)
          return done(err);
        expect(_user).to.be.ok;
        if (_user.displayName === 'testing user with change')
          return done();

        return done(new Error('Failed to update user'));
      });
    });
  });

  it("should apply filter on user level", function (done) {
    var filter = [
      ['test1', 'eq', 'test2']
    ];
    var user = {
      username: 'tester-' + this.uid,
      displayName: 'tester user',
      password: '1234',
      roles: ['user'],
      filter: filter,
      workspace: this.workspace
    };
    engine.users.patch(this.context, this.workspace, user.username, user, function (err, user) {
      if (err)
        return done(err);
      expect(user.filter).to.equal(filter);
      return done(err);
    });
  });

  it("should fail updating a non existing user", function (done) {
    var user = {
      username: 'tester-' + engine.common.uuid(),
      displayName: 'tester user',
      password: '1234',
      roles: ['user'],
      filter: '',
      workspace: 'test-org'
    };
    engine.users.patch(this.context, this.workspace, user.username, user, function (err, user) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should authenticate users with correct credentials", function (done) {
    var self = this;
    var user = {
      username: 'tester-password-' + this.uid,
      displayName: 'tester user',
      password: 'password',
      roles: ['user'],
      filter: '',
      workspace: this.workspace
    };
    engine.users.add(this.context, this.workspace, user, function (err, user) {
      if (err)
        return done(err);
      engine.users.authenticate(self.context, self.workspace, 'tester-password-' + self.uid, 'password', function (err, user) {
        if (err)
          return done(err);
        if (!user)
          return done(new Error('We should have a valid user'));
        return done();
      });
    });
  });

  it("should not authenticate users with incorrect credentials", function (done) {
    engine.users.authenticate(this.context, this.workspace, 'test', 'incorrect.password', function (err, user) {
      if (err)
        return done();
      if (!user)
        return done();
      return done(new Error('This should fail'));
    });
  });

  it("should get a userby token", function (done) {
    var self = this;
    var user = {
      username: 'tester-api-by-token-' + this.uid,
      displayName: 'tester user',
      password: '1234',
      roles: ['user'],
      filter: '',
      workspace: this.workspace
    };
    engine.users.add(this.context, this.workspace, user, function (err, user) {
      engine.auth.generateToken(user, function (err, token) {
        if (err)
          return done(err);

        engine.users.getByToken(self.context, token._, function (err, _user) {
          if (err)
            return done(err);

          expect(_user.username).to.equal(user.username);
          done(null);
        });
      });
    });
  });

  it("should validate a correct username/password", function (done) {
    engine.users.authenticate(this.context, this.workspace, 'tester-api-by-token-' + this.uid, '1234', function (err, user) {
      if (err)
        return done(err);

      expect(user).to.be.ok;
      return done();
    });
  });

  it("should fail validating incorrect username/password [missing user]", function (done) {
    engine.users.authenticate(this.context, this.workspace, '1tester-api-by-token-' + this.uid, '1234', function (err, user) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail validating incorrect username/password [password mismatch]", function (done) {
    engine.users.authenticate(this.context, this.workspace, 'tester-api-by-token-' + this.uid, '12345', function (err, user) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should validate a changed password", function (done) {
    var self = this;
    var user = {
      username: 'tester-' + this.uid,
      displayName: 'testing user',
      password: '12345',
      roles: ['user'],
      filter: '',
      workspace: this.workspace
    };
    user.displayName = 'testing user with change';
    engine.users.patch(self.context, self.workspace, user.username, user, function (err) {
      if (err)
        return done(err);
      engine.users.authenticate(self.context, self.workspace, 'tester-' + self.uid, '12345', function (err, user) {
        if (err)
          return done(err);

        expect(user).to.be.ok;
        return done();
      });
    });
  });

  it("should delete a user", function (done) {
    var self = this;
    var user = {
      username: 'tester-' + this.uid
    };
    engine.users.delete(this.context, this.workspace, user.username, function (err) {
      if (err)
        return done(err);
      engine.users.get(self.context, self.workspace, user.username, function (err, user) {
        if (user)
          return done('This should fail'+JSON.stringify(user));
        else
          return done();
      });
    });
  });

  it("should fail deleting a non existing user", function (done) {
    var self = this;
    var user = {
      username: 'tester1-' + this.uid
    };
    engine.users.delete(this.context, this.workspace, user, function (err) {
      if (err)
        return done();
      return done('This should fail');
    });
  });

  it("should verify a valid APIToken", function (done) {
    engine.users.verifyAPIToken(this.context, 'apitoken-test', function (err, user) {
      if (err)
        return done(err);

      expect(user).to.be.ok;
      return done();
    });
  });

  it("should fail verifying a non-existing APIToken", function (done) {
    engine.users.verifyAPIToken(this.context, '000012345', function (err, user) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});