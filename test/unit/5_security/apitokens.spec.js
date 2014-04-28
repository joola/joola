var
  async = require('async');

describe("security-apitokens", function () {
  before(function (done) {
    var self = this;
    this.uid = joola.common.uuid();

    joolaio.set('APIToken', 'apitoken-root', function () {

      self.workspace = {
        key: 'test-org-apitoken-' + self.uid,
        name: 'test-org-apitoken-' + self.uid
      };
      self.role = {
        key: 'test-user-role-' + self.uid,
        _permissions: ['access_system']
      };
      self.user = {
        username: 'test-user-' + self.uid,
        _password: 'password',
        workspace: self.workspace.key,
        _roles: ['test-user-role-' + self.uid],
        _APIToken: 'user-' + self.uid
      };
      var calls = [];

      calls.push(function (callback) {
        joolaio.workspaces.add(self.workspace, callback);
      });
      calls.push(function (callback) {
        joolaio.roles.add(self.workspace.key, self.role, callback);
      });
      calls.push(function (callback) {
        joolaio.users.add(self.workspace.key, self.user, callback);
      });
      async.series(calls, done);
    });
  });

  it("should be able to use a newly created APIToken", function (done) {
    var self = this;

    joolaio.set('APIToken', 'user-' + self.uid, function () {
      joolaio.system.version(done);
    });
  });
});