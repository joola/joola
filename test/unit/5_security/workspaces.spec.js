var
  async = require('async');

describe("workspaces", function () {
  before(function (done) {
    var self = this;
    this.uid = joola.common.uuid();

    joola.set('APIToken', 'apitoken-demo', function () {
      self.workspace = {
        key: 'test-org-permissions-' + self.uid,
        name: 'test-org-permissions-' + self.uid
      };
      self.role_admin = {
        key: 'test-admin-role-' + self.uid,
        permissions: ['access_system', 'workspaces:list', 'workspaces:get', 'workspaces:patch', 'workspaces:delete']
      };
      self.role_guest = {
        key: 'test-guest-role-' + self.uid,
        permissions: ['access_system']
      };
      self.role_user = {
        key: 'test-user-role-' + self.uid,
        permissions: ['access_system', 'workspaces:list', 'workspaces:get']
      };

      self.user_admin = {
        username: 'test-admin-' + self.uid,
        password: 'password',
        workspace: self.workspace.key,
        roles: ['test-admin-role-' + self.uid],
        APIToken: 'admin-' + self.uid
      };
      self.user_guest = {
        username: 'test-guest-' + self.uid,
        password: 'password',
        workspace: self.workspace.key,
        roles: ['test-guest-role-' + self.uid],
        APIToken: 'guest-' + self.uid
      };
      self.user_user = {
        username: 'test-user-' + self.uid,
        password: 'password',
        workspace: self.workspace.key,
        roles: ['test-user-role-' + self.uid],
        APIToken: 'user-' + self.uid
      };
      self.user_fordelete = {
        username: 'test-fordelete-' + self.uid,
        password: 'password',
        workspace: self.workspace.key,
        roles: ['test-guest-role-' + self.uid],
        APIToken: 'fordelete-' + self.uid
      };

      var calls = [];

      calls.push(function (callback) {
        joola.workspaces.add(self.workspace, callback);
      });
      calls.push(function (callback) {
        joola.roles.add(self.workspace.key, self.role_admin, callback);
      });
      calls.push(function (callback) {
        joola.roles.add(self.workspace.key, self.role_guest, callback);
      });
      calls.push(function (callback) {
        joola.roles.add(self.workspace.key, self.role_user, callback);
      });
      calls.push(function (callback) {
        joola.users.add(self.workspace.key, self.user_admin, callback);
      });
      calls.push(function (callback) {
        joola.users.add(self.workspace.key, self.user_guest, callback);
      });
      calls.push(function (callback) {
        joola.users.add(self.workspace.key, self.user_user, callback);
      });
      calls.push(function (callback) {
        joola.users.add(self.workspace.key, self.user_fordelete, callback);
      });
      async.series(calls, done);
    });
  });

  it("su should be able to list workspaces", function (done) {
    var self = this;
    joola.set('APIToken', 'apitoken-demo', function () {
      joola.workspaces.list(done);
    });
  });

  it("guest should not be able to list workspaces", function (done) {
    var self = this;

    joola.set('APIToken', self.user_guest.APIToken, function () {
      joola.workspaces.list(function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("user should be able to list its workspace", function (done) {
    var self = this;

    joola.set('APIToken', self.user_user.APIToken, function () {
      joola.workspaces.list(function (err, list) {
        if (err)
          return done(err);
        expect(list.length).to.equal(1);
        return done();
      });
    });
  });

  it("admin should be able to list its workspace", function (done) {
    var self = this;

    joola.set('APIToken', self.user_admin.APIToken, function () {
      joola.workspaces.list(function (err, list) {
        if (err)
          return done(err);
        expect(list.length).to.equal(1);
        return done();
      });
    });
  });

  it("admin should not be able to list other workspaces", function (done) {
    var self = this;

    joola.set('APIToken', self.user_admin.APIToken, function () {
      joola.workspaces.list(function (err, list) {
        if (err)
          return done(err);
        expect(list.length).to.equal(1);
        done();
      });
    });
  });

  it("guest should not be able to list workspaces", function (done) {
    var self = this;

    joola.set('APIToken', self.user_guest.APIToken, function () {
      joola.workspaces.list(function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("user should be able to get its workspace", function (done) {
    var self = this;

    joola.set('APIToken', self.user_user.APIToken, function () {
      joola.workspaces.get(self.workspace.key, function (err, wrk) {
        if (err)
          return done(err);
        expect(wrk).to.be.ok;
        return done();
      });
    });
  });

  it("admin should be able to get its workspace", function (done) {
    var self = this;

    joola.set('APIToken', self.user_admin.APIToken, function () {
      joola.workspaces.get(self.workspace.key, function (err, wrk) {
        if (err)
          return done(err);
        expect(wrk).to.be.ok;
        return done();
      });
    });
  });

  it("user should not be able to get another workspace", function (done) {
    var self = this;

    joola.set('APIToken', self.user_user.APIToken, function () {
      joola.workspaces.get('root', function (err, wrk) {
        if (err)
          return done();
        return done(new Error('this should not fail'));
      });
    });
  });

  it("admin should not be able to get another workspace", function (done) {
    var self = this;

    joola.set('APIToken', self.user_admin.APIToken, function () {
      joola.workspaces.get('root', function (err, wrk) {
        if (err)
          return done();
        return done(new Error('this should not fail'));
      });
    });
  });

  it("user should not be able to create workspace", function (done) {
    var self = this;

    joola.set('APIToken', self.user_user.APIToken, function () {
      joola.workspaces.add(self.workspace, function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("admin should not be able to create workspace", function (done) {
    var self = this;

    joola.set('APIToken', self.user_admin.APIToken, function () {
      joola.workspaces.add(self.workspace, function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("user should not be able to update workspace", function (done) {
    var self = this;

    joola.set('APIToken', self.user_user.APIToken, function () {
      joola.workspaces.patch(self.workspace.key, self.workspace, function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("admin should be able to update its workspace", function (done) {
    var self = this;

    joola.set('APIToken', self.user_admin.APIToken, function () {
      joola.workspaces.patch(self.workspace.key, self.workspace, function (err, list) {
        if (err)
          return done(err);

        return done();
      });
    });
  });

  it("admin should not be able to update another workspace", function (done) {
    var self = this;

    joola.set('APIToken', self.user_admin.APIToken, function () {
      joola.workspaces.patch('root', self.workspace, function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });
});