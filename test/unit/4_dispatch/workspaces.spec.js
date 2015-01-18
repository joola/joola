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

describe("workspaces", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();

    done();
  });

  after(function (done) {
    var self = this;
    engine.workspaces.delete(this.context, 'test-workspace-' + this.uid, function () {
      engine.workspaces.delete(self.context, 'test-workspace1-' + self.uid, function () {
        done();
      });
    });
  });

  it("should add a workspace", function (done) {
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid,
      filter: []
    };
    engine.workspaces.add(this.context, workspace, function (err, _workspace) {
      if (err)
        return done(err);

      expect(_workspace).to.be.ok;
      done();
    });
  });

  it("should return a valid list of workspaces", function (done) {
    engine.workspaces.list(this.context, function (err, workspaces) {
      return done(err);
    });
  });

  it("should fail adding an existing workspace", function (done) {
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid,
      filter: []
    };
    engine.workspaces.add(this.context, workspace, function (err, _workspace) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail to add an workspace with incomplete details", function (done) {
    var workspace = {

    };
    engine.workspaces.add(this.context, workspace, function (err, _workspace) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should update a workspace", function (done) {
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid,
      filter: 'test=test'
    };
    engine.workspaces.patch(this.context, workspace.key, workspace, function (err, _workspace) {
      if (err)
        return done(err);
      expect(_workspace.filter).to.equal('test=test');
      done();
    });
  });

  it("should fail updating unknown workspace", function (done) {
    var workspace = {
      key: 'test-workspace1-' + this.uid,
      name: 'test-workspace-' + this.uid,
      filter: 'test=test'
    };
    engine.workspaces.patch(this.context, workspace.key, workspace, function (err, _workspace) {
      if (err)
        return done();

      done(new Error('This should have failed'));
    });
  });

  xit("should apply filter on workspace members", function (done) {
    var user = {
      username: 'tester-workspace-filter',
      displayName: 'tester user',
      password: '1234',
      roles: ['user'],
      filter: '',
      workspace: 'test-workspace-' + this.uid
    };
    engine.users.add(this.context, 'test-workspace-' + this.uid, user, function (err, user) {
      if (err)
        return done(err);
      expect(user.filter).to.equal('test=test');
      return done(err);
    });
  });

  it("should delete a workspace", function (done) {
    var self = this;
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid
    };
    engine.workspaces.delete(this.context, workspace.key, function (err) {
      if (err)
        return done(err);

      engine.workspaces.list(self.context, function (err, workspaces) {
        if (err)
          return done(err);

        var exist = _.filter(workspaces, function (item) {
          return item.key == 'test-workspace-' + self.uid;
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
    engine.workspaces.delete(this.context, workspace.key, function (err) {
      if (err)
        return done();

      return done(new Error('This shouldn\'t fail'));
    });
  });

  it("should add a workspace with dot `.` in name", function (done) {
    var self = this;
    var workspace = {
      key: 'test.workspace-' + this.uid,
      name: 'test.workspace-' + this.uid,
      filter: []
    };
    engine.workspaces.add(this.context, workspace, function (err, _workspace) {
      if (err)
        return done(err);

      expect(_workspace).to.be.ok;

      engine.workspaces.get(self.context, workspace.key, function (err, __workspace) {
        expect(__workspace).to.be.ok;
        done();
      });
    });
  });

  it("should create a new workspace user and push documents (issue #592)", function (done) {
    var self = this;
    this.workspace = {
      key: 'test.workspace-592-' + this.uid,
      name: 'test.workspace-592-' + this.uid,
      filter: []
    };
    engine.workspaces.add(this.context, self.workspace, function (err, _workspace) {
      if (err)
        return done(err);

      expect(_workspace).to.be.ok;
      engine.workspaces.get(self.context, self.workspace.key, function (err, __workspace) {
        expect(__workspace).to.be.ok;
        var role = {
          key: 'test-role-592-' + self.uid,
          permissions: ['beacon:insert']
        };
        self.context.user.workspace = self.workspace.key;
        engine.roles.add(self.context, self.workspace.key, role, function (err, _role) {
          if (err)
            return done(err);

          expect(_role).to.be.ok;
          var user = {
            username: 'tester-592-' + self.uid,
            displayName: 'tester user',
            password: '1234',
            roles: role.key,
            filter: '',
            workspace: self.workspace.key
          };
          engine.users.add(self.context, self.workspace.key, user, function (err, _user) {
            expect(_user).to.be.ok;
            engine.beacon.insert(self.context, self.workspace.key, 'collection-592', {timestamp: null, value: 1}, function (err, result) {
              self.context.user.workspace = '_test';
              return done(err);
            });
          });
        });
      });
    });
  });

});