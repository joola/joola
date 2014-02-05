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
    return done();
    var calls = [];

    var call = function (callback) {
      joola.config.clear('authentication:users:tester', callback);
    };
    calls.push(call);
    call = function (callback) {
      joola.config.clear('authentication:users:tester1', callback);
    };
    calls.push(call);
    var call = function (callback) {
      joola.config.clear('authentication:users:tester-org', callback);
    };
    calls.push(call);
    call = function (callback) {
      joola.config.clear('authentication:users:tester-password', callback);
    };
    calls.push(call);
    call = function (callback) {
      joola.config.clear('authentication:users:tester-api-by-token', callback);
    };
    calls.push(call);
    call = function (callback) {
      joola.dispatch.organizations.delete({name: 'test-org'}, function () {
        joola.dispatch.organizations.add({name: 'test-org'}, callback);
      });
    };
    calls.push(call);
    async.parallel(calls, done);
  });

  xit("should have a valid users dispatch", function (done) {
    expect(joola.dispatch.users).to.be.ok;
    return done();
  });

  xit("should list all available users", function (done) {
    joola.dispatch.users.list(function (err, users) {
      return done(err);
    });
  });

  xit("should add a user", function (done) {
    var user = {
      username: 'tester',
      displayName: 'tester user',
      _password: '1234',
      _roles: ['user'],
      _filter: '',
      organization: 'test-org'
    };
    joola.dispatch.users.add(user, function (err, user) {
      return done(err);
    });
  });

  xit("should fail adding a user with incomplete details", function (done) {
    var user = {
      username: 'tester2'
    };
    joola.dispatch.users.add(user, function (err, user) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  xit("should get a user by username", function (done) {
    var username = 'tester';
    joola.dispatch.users.get(username, function (err, user) {
      if (err)
        return done(err);
      expect(user).to.be.ok;
      expect(user.username).to.equal('tester');
      return done();
    });
  });

  xit("should fail adding a user with an already existing username", function (done) {
    var user = {
      username: 'tester',
      displayName: 'tester user',
      _password: '1234',
      _roles: ['user'],
      _filter: '',
      organization: 'test-org'
    };
    joola.dispatch.users.add(user, function (err, user) {
      if (err)
        return done();
      return done(new Error('This should fail.'));
    });
  });

  xit("should update a user", function (done) {
    var user = {
      username: 'tester1',
      displayName: 'testing user',
      _password: '1234',
      _roles: ['user'],
      _filter: '',
      organization: 'test-org'
    };
    joola.dispatch.users.add(user, function (err, _user) {
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

  xit("should apply filter on user level", function (done) {
    var user = {
      username: 'tester-org',
      displayName: 'tester user',
      _password: '1234',
      _roles: ['user'],
      _filter: 'test1=test2',
      organization: 'test-org'
    };
    joola.dispatch.users.add(user, function (err, user) {
      if (err)
        return done(err);
      expect(user._filter).to.equal('test1=test2');
      return done(err);
    });
  });

  xit("should fail updating a non existing user", function (done) {
    var user = {
      username: 'tester2',
      displayName: 'tester user',
      _password: '1234',
      _roles: ['user'],
      _filter: '',
      organization: 'test-org'
    };
    joola.dispatch.users.update(user, function (err, user) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  xit("should authenticate users with correct credentials", function (done) {
    joola.dispatch.users.authenticate('tester', '1234', function (err, user) {
      if (err)
        return done(err);
      if (!user)
        return done(new Error('We should have a valid user'));
      return done();
    });
  });

  xit("should not authenticate users with incorrect credentials", function (done) {
    joola.dispatch.users.authenticate('tester', '12345', function (err, user) {
      if (err)
        return done();
      if (!user)
        return done();
      return done(new Error('This should fail'));
    });
  });

  xit("should delete a user", function (done) {
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

  xit("should get a userby token", function (done) {
    var user = {
      username: 'tester-api-by-token',
      displayName: 'tester user',
      _password: '1234',
      _roles: ['user'],
      _filter: '',
      organization: 'test-org'
    };
    joola.dispatch.users.add(user, function (err, user) {
      joola.auth.generateToken(user, function (err, token) {
        if (err)
          return done(err);

        joola.dispatch.users.getByToken(token._, function (err, _user) {
          if (err)
            return done(err);

          expect(_user.username).to.equal(user.username);
          done(null);
        });
      });
    });
  });
});