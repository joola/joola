var
  async = require('async');

describe("security-permissions-users", function () {
  before(function (done) {
    var self = this;
    this.uid = joola.common.uuid();

    joolaio.set('APIToken', 'apitoken-root', function () {
      self.workspace = {
        key: 'test-org-permissions-' + self.uid,
        name: 'test-org-permissions-' + self.uid
      };
      self.role_admin = {
        key: 'test-admin-role-' + self.uid,
        _permissions: ['access_system', 'manage_system', 'manage_users']
      };
      self.role_guest = {
        key: 'test-guest-role-' + self.uid,
        _permissions: ['access_system']
      };
      self.role_user = {
        key: 'test-user-role-' + self.uid,
        _permissions: ['access_system']
      };

      self.user_admin = {
        username: 'test-admin-' + self.uid,
        _password: 'password',
        workspace: self.workspace.key,
        _roles: ['test-admin-role-' + self.uid],
        _APIToken: 'admin-' + self.uid
      };
      self.user_guest = {
        username: 'test-guest-' + self.uid,
        _password: 'password',
        workspace: self.workspace.key,
        _roles: ['test-guest-role-' + self.uid],
        _APIToken: 'guest-' + self.uid
      };
      self.user_user = {
        username: 'test-user-' + self.uid,
        _password: 'password',
        workspace: self.workspace.key,
        _roles: ['test-user-role-' + self.uid],
        _APIToken: 'user-' + self.uid
      };
      self.user_fordelete = {
        username: 'test-fordelete-' + self.uid,
        _password: 'password',
        workspace: self.workspace.key,
        _roles: ['test-guest-role-' + self.uid],
        _APIToken: 'fordelete-' + self.uid
      };

      var calls = [];

      calls.push(function (callback) {
        joolaio.workspaces.add(self.workspace, callback);
      });
      calls.push(function (callback) {
        joolaio.roles.add(self.workspace.key, self.role_admin, callback);
      });
      calls.push(function (callback) {
        joolaio.roles.add(self.workspace.key, self.role_guest, callback);
      });
      calls.push(function (callback) {
        joolaio.roles.add(self.workspace.key, self.role_user, callback);
      });
      calls.push(function (callback) {
        joolaio.users.add(self.workspace.key, self.user_admin, callback);
      });
      calls.push(function (callback) {
        joolaio.users.add(self.workspace.key, self.user_guest, callback);
      });
      calls.push(function (callback) {
        joolaio.users.add(self.workspace.key, self.user_user, callback);
      });
      calls.push(function (callback) {
        joolaio.users.add(self.workspace.key, self.user_fordelete, callback);
      });
      async.series(calls, done);
    });
  });

  it("su should be able to list users", function (done) {
    var self = this;

    joolaio.set('APIToken', 'apitoken-root', function () {
      joolaio.users.list('root', done);
    });
  });

  it("guest should not be able to list users", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_guest._APIToken, function () {
      joolaio.users.list('root', function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("user should not be able to list users", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_user._APIToken, function () {
      joolaio.users.list(self.workspace.key, function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("admin should be able to list users for its workspace", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_admin._APIToken, function () {
      joolaio.users.list(self.workspace.key, function (err, list) {
        if (err)
          return done(err);

        return done();
      });
    });
  });

  it("admin should not be able to list users for other workspaces", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_admin._APIToken, function () {
      joolaio.users.list('root', function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("user should not be able to get user", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_user._APIToken, function () {
      joolaio.users.get(self.workspace.key, self.user_admin.username, function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("admin should be able to get users for its workspace", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_admin._APIToken, function () {
      joolaio.users.get(self.workspace.key, self.user_admin.username, function (err, list) {
        if (err)
          return done(err);

        return done();
      });
    });
  });

  it("admin should not be able to get users for other workspaces", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_admin._APIToken, function () {
      joolaio.users.get('root', self.user_admin.username, function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("user should not be able to update user", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_user._APIToken, function () {
      joolaio.users.update(self.workspace.key, self.user_admin, function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("admin should be able to update users for its workspace", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_admin._APIToken, function () {
      joolaio.users.update(self.workspace.key, self.user_admin, function (err, user) {
        if (err)
          return done(err);

        return done();
      });
    });
  });

  it("admin should not be able to update users for other workspaces", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_admin._APIToken, function () {
      joolaio.users.update('root', self.user_admin, function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("user should not be able to delete user", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_user._APIToken, function () {
      joolaio.users.delete(self.workspace.key, self.user_fordelete, function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });

  it("admin should be able to delete users for its workspace", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_admin._APIToken, function () {
      joolaio.users.delete(self.workspace.key, self.user_fordelete, function (err, list) {
        if (err)
          return done(err);

        return done();
      });
    });
  });

  it("admin should not be able to delete users for other workspaces", function (done) {
    var self = this;

    joolaio.set('APIToken', self.user_admin._APIToken, function () {
      joolaio.users.delete('root', self.user_fordelete, function (err, list) {
        if (err)
          return done();

        return done('This should not fail');
      });
    });
  });
});