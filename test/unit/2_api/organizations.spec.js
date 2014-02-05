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


describe("api-organizations", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = joola.common.uuid();
    done();
  });
  /*
   before(function (done) {
   var calls = [];

   var call = function (callback) {
   joola.config.clear('authentication:users:tester-org-filter', callback);
   };
   calls.push(call);
   call = function (callback) {
   joola.config.clear('authentication:organizations:test-org', callback);
   };
   calls.push(call);

   async.parallel(calls, done);
   });*/

  it("should add an organization", function (done) {
    var org = {
      id: 'test-org-' + this.uid,
      name: 'test-org-' + this.uid,
      _filter: ''
    };
    joola.dispatch.organizations.add(this.context, org, function (err, _org) {
      if (err)
        return done(err);

      expect(_org).to.be.ok;
      done();
    });
  });

  it("should return a valid list of organizations", function (done) {
    joola.dispatch.organizations.list(this.context, function (err, orgs) {
      return done(err);
    });
  });

  it("should fail adding an existing organization", function (done) {
    var org = {
      id: 'test-org-' + this.uid,
      name: 'test-org-' + this.uid,
      _filter: ''
    };
    joola.dispatch.organizations.add(this.context, org, function (err, _org) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail to add an organization with incomplete details", function (done) {
    var org = {

    };
    joola.dispatch.organizations.add(this.context, org, function (err, _org) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should update an organization", function (done) {
    var org = {
      id: 'test-org-' + this.uid,
      name: 'test-org-' + this.uid,
      _filter: 'test=test'
    };
    joola.dispatch.organizations.update(this.context, org, function (err, _org) {
      if (err)
        return done(err);
      expect(_org._filter).to.equal('test=test');
      done();
    });
  });

  it("should apply filter on organization members", function (done) {
    var user = {
      username: 'tester-org-filter',
      displayName: 'tester user',
      _password: '1234',
      _roles: ['user'],
      _filter: '',
      organization: 'test-org-' + this.uid
    };
    joola.dispatch.users.add(this.context, 'test-org-' + this.uid, user, function (err, user) {
      console.log('done', err, user);
      if (err)
        return done(err);
      expect(user._filter).to.equal('test=test');
      return done(err);
    });
  });

  it("should delete an organization", function (done) {
    var self = this;
    var org = {
      id: 'test-org-' + this.uid,
      name: 'test-org-' + this.uid
    };
    joola.dispatch.organizations.delete(this.context, org, function (err) {
      if (err)
        return done(err);

      joola.dispatch.organizations.list(self.context, function (err, orgs) {
        if (err)
          return done(err);

        var exist = _.filter(orgs, function (item) {
          return item.name == 'test-org-' + self.uid;
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

  it("should fail deleting a non existing organization", function (done) {
    var org = {
      name: 'test-org-' + this.uid
    };
    joola.dispatch.organizations.delete(this.context, org, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});