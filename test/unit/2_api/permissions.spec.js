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

describe("api-permissions", function () {
  before(function (done) {
    return done();
    var calls = [];

    var call = function (callback) {
      joola.config.clear('authentication:permissions:tester-permissions-filter', callback);
    };
    calls.push(call);
    call = function (callback) {
      joola.config.clear('authentication:permissions:test-permission', callback);
    };
    calls.push(call);

    async.parallel(calls, done);
  });

  xit("should add a permission", function (done) {
    var permission = {
      name: 'test-permission'
    };
    joola.dispatch.permissions.add(permission, function (err, _permission) {
      if (err)
        return done(err);

      expect(_permission).to.be.ok;
      done();
    });
  });

  xit("should return a valid list of permissions", function (done) {
    joola.dispatch.permissions.list(function (err, permissions) {
      return done(err);
    });
  });

  xit("should fail adding an existing permission", function (done) {
    var permission = {
      name: 'test-permission'
    };
    joola.dispatch.permissions.add(permission, function (err, _permission) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  xit("should delete a permission", function (done) {
    var permission = {
      name: 'test-permission'
    };
    joola.dispatch.permissions.delete(permission, function (err) {
      if (err)
        return done(err);

      joola.dispatch.permissions.list(function (err, permissions) {
        if (err)
          return done(err);

        var exist = _.filter(permissions, function (item) {
          return item.name == 'test-permission';
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

  xit("should fail deleting a non existing permission", function (done) {
    var permission = {
      name: 'test-permission-notexist'
    };
    joola.dispatch.permissions.delete(permission, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});