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

describe("permissions", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    this.workspace = 'test-org-' + engine.common.uuid();
    done();
  });

  it("should return a valid list of permissions", function (done) {
    engine.permissions.list(this.context, function (err, permissions) {
      return done(err);
    });
  });

  it("should get a permission", function (done) {
    engine.permissions.get(this.context, 'access_system', function (err, permissions) {
      return done(err);
    });
  });

  it("should not get a not existing permission", function (done) {
    engine.permissions.get(this.context, 'access_system2', function (err, permissions) {
      if (err)
        return done();
      return done(new Error('This should not fail'));
    });
  });
});