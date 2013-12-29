/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

var
  async = require('async'),
  Browser = require('zombie');

describe('browser-flow-login', function () {
  before(function (done) {
    //let's create our users
    var calls = [];
    var call = function (callback) {
      joola.config.clear('authentication:organizations:demo-org-test', callback);
    };
    calls.push(call);
    var call = function (callback) {
      joola.config.clear('authentication:users:demo-test', callback);
    };
    calls.push(call);
    call = function (callback) {
      joola.dispatch.organizations.add({name: 'demo-org-test'}, function (err) {
        if (err)
          console.log(err);
        var user = {
          username: 'demo-test',
          displayName: 'demo test user',
          _password: 'password',
          _roles: ['user'],
          _filter: '',
          organization: 'demo-org-test'
        };
        joola.dispatch.users.add(user, function (err, user) {
          console.log(err)
          return callback();
        })
      });

    };
    calls.push(call);
    async.series(calls, done);
  });

  xit('should load the login page when first asked for analytics', function (done) {
    var browser = new Browser({silent: true});
    browser.visit('http://localhost:' + joola.config.interfaces.webserver.port + '/', function () {
      expect(browser.text("title")).to.equal('joola.io - Login');
      expect(browser.redirected).to.equal(true);
      expect(browser.location.href).to.equal('http://localhost:' + joola.config.interfaces.webserver.port + '/login')
      done();
    });
  });

  xit('should decline invalid authentication', function (done) {
    var browser = new Browser({silent: true});
    browser.visit('http://localhost:' + joola.config.interfaces.webserver.port + '/', function () {
      browser
        .fill('#email', 'demo-test')
        .fill('#password', 'password1')
        .pressButton('Sign in', function () {
          expect(browser.success).to.equal(true);
          expect(browser.text("title")).to.equal('joola.io - Login');
          done();
        });
    });
  });

  xit('should allow valid authentication', function (done) {
    var browser = new Browser({silent: true});
    browser.visit('http://localhost:' + joola.config.interfaces.webserver.port + '/', function () {
      browser
        .fill('#email', 'demo-test')
        .fill('#password', 'password')
        .pressButton('Sign in', function () {
          expect(browser.success).to.equal(true);
          expect(browser.text("title")).to.equal('joola.io');
          done();
        });
    });
  });
});