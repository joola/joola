/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var orig_env = process.env.NODE_ENV;

before(function (done) {
  var started = false;

  try {
    _joolaio = require('../../joola.io.js');
    joola.state.on('state:change', function (state) {
      if ((state == 'working' || state == 'online') && !started) {
        started = true;

        var testUser = {
          username: 'test-user',
          displayName: 'testing user',
          _password: '1234',
          _roles: ['admin'],
          _filter: '',
          organization: 'testOrg'
        };

        joola.auth.generateToken(testUser, function (err, _token) {
          if (err)
            throw err;

          _sdk = require('../../lib/sdk/index');
          var options = {
            TOKEN: _token._,
            isBrowser: false,
            debug: {
              enabled: false,
              events: {
                enabled: false,
                trace: false
              },
              functions: {
                enabled: false
              }
            }
          };
          _sdk.init(options, function (err) {
            if (err)
              throw err;

            return done();
          });
        });
      }
      else if (!started)
        throw new Error('Failed to startup joola.io');
    });
  }
  catch (ex) {
    console.log(ex);
    console.log(ex.stack);
    throw ex;
  }
});

after(function (done) {
  process.env.NODE_ENV = orig_env;
  done();
});
