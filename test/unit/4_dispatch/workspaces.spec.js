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


describe("workspaces", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = joola.common.uuid();
    done();
  });
  /*
   before(function (done) {
   var calls = [];

   var call = function (callback) {
   joola.config.clear('authentication:users:tester-workspace-filter', callback);
   };
   calls.push(call);
   call = function (callback) {
   joola.config.clear('authentication:workspaces:test-workspace', callback);
   };
   calls.push(call);

   async.parallel(calls, done);
   });*/

  it("should add an workspace", function (done) {
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid,
      _filter: ''
    };
    joola.dispatch.workspaces.add(this.context, workspace, function (err, _workspace) {
      if (err)
        return done(err);

      expect(_workspace).to.be.ok;
      done();
    });
  });

  it("should return a valid list of workspaces", function (done) {
    joola.dispatch.workspaces.list(this.context, function (err, workspaces) {
      return done(err);
    });
  });

  it("should fail adding an existing workspace", function (done) {
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid,
      _filter: ''
    };
    joola.dispatch.workspaces.add(this.context, workspace, function (err, _workspace) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail to add an workspace with incomplete details", function (done) {
    var workspace = {

    };
    joola.dispatch.workspaces.add(this.context, workspace, function (err, _workspace) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should update an workspace", function (done) {
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid,
      _filter: 'test=test'
    };
    joola.dispatch.workspaces.update(this.context, workspace, function (err, _workspace) {
      if (err)
        return done(err);
      expect(_workspace._filter).to.equal('test=test');
      done();
    });
  });

  it("should fail updating unknown workspace", function (done) {
    var workspace = {
      key: 'test-workspace1-' + this.uid,
      name: 'test-workspace-' + this.uid,
      _filter: 'test=test'
    };
    joola.dispatch.workspaces.update(this.context, workspace, function (err, _workspace) {
      if (err)
        return done();

      done(new Error('This should have failed'));
    });
  });

  it("should fail updating workspace with incomplete details", function (done) {
    var workspace = {
      key: 'test-workspace1-' + this.uid
    };
    joola.dispatch.workspaces.update(this.context, workspace, function (err, _workspace) {
      if (err)
        return done();

      done(new Error('This should have failed'));
    });
  });
  
  it("should apply filter on workspace members", function (done) {
    var user = {
      username: 'tester-workspace-filter',
      displayName: 'tester user',
      _password: '1234',
      _roles: ['user'],
      _filter: '',
      workspace: 'test-workspace-' + this.uid
    };
    joola.dispatch.users.add(this.context, 'test-workspace-' + this.uid, user, function (err, user) {
      if (err)
        return done(err);
      expect(user._filter).to.equal('test=test');
      return done(err);
    });
  });

  it("should delete an workspace", function (done) {
    var self = this;
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid
    };
    joola.dispatch.workspaces.delete(this.context, workspace, function (err) {
      if (err)
        return done(err);

      joola.dispatch.workspaces.list(self.context, function (err, workspaces) {
        if (err)
          return done(err);

        var exist = _.filter(workspaces, function (item) {
          return item.name == 'test-workspace-' + self.uid;
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

  it("should fail deleting a non existing workspace", function (done) {
    var workspace = {
      key: 'test-workspace-' + this.uid
    };
    joola.dispatch.workspaces.delete(this.context, workspace, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});