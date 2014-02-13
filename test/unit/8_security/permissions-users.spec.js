var
  async = require('async');

describe("security-permissions-users", function () {
  before(function (done) {
    var self = this;
    this.uid = joola.common.uuid();

    joolaio.options.APIToken = '12345';

    self.organization = {
      id: 'test-org-permissions-' + self.uid,
      name: 'test-org-permissions-' + self.uid
    };
    self.role_admin = {
      name: 'test-admin-role-' + self.uid,
      permissions: ['manage_users']
    };
    self.role_guest = {
      name: 'test-guest-role-' + self.uid,
      permissions: []
    };
    self.role_user = {
      name: 'test-user-role-' + self.uid,
      permissions: ['access_system']
    };

    self.user_admin = {
      username: 'test-admin-' + self.uid,
      _password: 'password',
      organization: self.organization.id,
      _roles: ['admin'],
      APIToken: 'admin-' + self.uid
    };
    self.user_guest = {
      username: 'test-guest-' + self.uid,
      _password: 'password',
      organization: self.organization.id,
      _roles: ['guest'],
      APIToken: 'guest-' + self.uid
    };
    self.user_user = {
      username: 'test-user-' + self.uid,
      _password: 'password',
      organization: self.organization.id,
      _roles: ['user'],
      APIToken: 'user-' + self.uid
    };
    self.user_fordelete = {
      username: 'test-fordelete-' + self.uid,
      _password: 'password',
      organization: self.organization.id,
      _roles: ['guest'],
      APIToken: 'fordelete-' + self.uid
    };

    var calls = [];

    calls.push(function (callback) {
      joolaio.roles.add(self.organization.name, self.role_admin, callback);
    });
    calls.push(function (callback) {
      joolaio.roles.add(self.organization.name, self.role_guest, callback);
    });
    calls.push(function (callback) {
      joolaio.roles.add(self.organization.name, self.role_user, callback);
    });
    calls.push(function (callback) {
      joolaio.users.add(self.organization.name, self.user_admin, callback);
    });
    calls.push(function (callback) {
      joolaio.users.add(self.organization.name, self.user_guest, callback);
    });
    calls.push(function (callback) {
      joolaio.users.add(self.organization.name, self.user_user, callback);
    });
    calls.push(function (callback) {
      joolaio.users.add(self.organization.name, self.user_fordelete, callback);
    });
    async.series(calls, done);
  });

  it("su should be able to list users", function (done) {
    var self = this;

    joolaio.options.APIToken = '12345';
    joolaio.users.list('joola', done);
  });

  it("guest should not be able to list users", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_guest.APIToken;
    joolaio.users.list('joola', function (err, list) {
      if (err)
        return done();

      return done('This should not fail');
    });
  });

  it("user should not be able to list users", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_user.APIToken;
    joolaio.users.list(self.organization.name, function (err, list) {
      if (err)
        return done();

      return done('This should not fail');
    });
  });

  it("admin should be able to list users for its organization", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_admin.APIToken;
    joolaio.users.list(self.organization.name, function (err, list) {
      if (err)
        return done(err);

      return done();
    });
  });

  it("admin should not be able to list users for other organizations", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_admin.APIToken;
    joolaio.users.list('joola', function (err, list) {
      if (err)
        return done();

      return done('This should not fail');
    });
  });

  it("user should not be able to get user", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_user.APIToken;
    joolaio.users.get(self.organization.name, self.user_admin.username, function (err, list) {
      if (err)
        return done();

      return done('This should not fail');
    });
  });

  it("admin should be able to get users for its organization", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_admin.APIToken;
    joolaio.users.get(self.organization.name, self.user_admin.username, function (err, list) {
      if (err)
        return done(err);

      return done();
    });
  });

  it("admin should not be able to get users for other organizations", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_admin.APIToken;
    joolaio.users.get('joola', self.user_admin.username, function (err, list) {
      if (err)
        return done();

      return done('This should not fail');
    });
  });


  it("user should not be able to update user", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_user.APIToken;
    joolaio.users.update(self.organization.name, self.user_admin, function (err, list) {
      if (err)
        return done();

      return done('This should not fail');
    });
  });

  it("admin should be able to update users for its organization", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_admin.APIToken;
    joolaio.users.update(self.organization.name, self.user_admin, function (err, list) {
      if (err)
        return done(err);

      return done();
    });
  });

  it("admin should not be able to update users for other organizations", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_admin.APIToken;
    joolaio.users.update('joola', self.user_admin, function (err, list) {
      if (err)
        return done();

      return done('This should not fail');
    });
  });

  it("user should not be able to delete user", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_user.APIToken;
    joolaio.users.delete(self.organization.name, self.user_fordelete, function (err, list) {
      if (err)
        return done();

      return done('This should not fail');
    });
  });

  it("admin should be able to delete users for its organization", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_admin.APIToken;
    joolaio.users.delete(self.organization.name, self.user_fordelete, function (err, list) {
      if (err)
        return done(err);

      return done();
    });
  });

  it("admin should not be able to delete users for other organizations", function (done) {
    var self = this;

    joolaio.options.APIToken = self.user_admin.APIToken;
    joolaio.users.delete('joola', self.user_fordelete, function (err, list) {
      if (err)
        return done();

      return done('This should not fail');
    });
  });
});