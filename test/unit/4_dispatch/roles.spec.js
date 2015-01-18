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

describe("roles", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    this.workspace = global.workspace;
    done();
  });

  it("should add a role", function (done) {
    var role = {
      key: 'test-role-' + this.uid,
      permissions: ['guest']
    };

    engine.roles.add(this.context, this.workspace, role, function (err, _role) {
      if (err)
        return done(err);

      expect(_role).to.be.ok;
      done();
    });
  });

  it("should return a valid list of roles", function (done) {
    engine.roles.list(this.context, this.workspace, function (err, roles) {
      return done(err);
    });
  });

  it("should fail adding an existing role", function (done) {
    var role = {
      key: 'test-role-' + this.uid,
      permissions: ['guest']
    };
    engine.roles.add(this.context, this.workspace, role, function (err, _role) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail to add a role with incomplete details", function (done) {
    var role = {
      key: 'test-role-missing-details'
    };
    engine.roles.add(this.context, this.workspace, role, function (err, _role) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should update a role", function (done) {
    var role = {
      key: 'test-role-' + this.uid,
      permissions: ['guest']
    };
    engine.roles.patch(this.context, this.workspace, role.key, role, function (err, _role) {
      if (err)
        return done(err);
      expect(_role.permissions.length).to.equal(1);
      done();
    });
  });

  it("should fail updating unknown role", function (done) {
    var role = {
      key: 'test-role1-' + this.uid,
      permissions: ['guest']
    };
    engine.roles.patch(this.context, this.workspace, role.key, role, function (err, _role) {
      if (err)
        return done();

      done(new Error('This should have failed'));
    });
  });

  it("should delete a role", function (done) {
    var self = this;
    var role = 'test-role-' + this.uid;
    engine.roles.delete(this.context, this.workspace, role, function (err) {
      if (err)
        return done(err);

      engine.roles.get(self.context, self.workspace, role, function (err, role) {
        if (err)
          return done();

        return done('Failed to delete role');
      });
    });
  });

  it("should fail deleting a non existing role", function (done) {
    var role = {
      key: 'test-role-notexist'
    };
    engine.roles.delete(this.context, this.workspace, role, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});