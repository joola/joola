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
  global.nolog = true;
  process.env.NODE_ENV = 'test';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //allow node-request to deal with Error: DEPTH_ZERO_SELF_SIGNED_CERT

  var started = false;

  try{
  _joolaio = require('../../joola.io.js');
  joola.state.on('state:change', function (state) {
    if ((state == 'working' || state == 'online') && !started) {
      started = true;
      _sdk = require('../../lib/sdk/index');
      var options = {
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
    }
    else if (!started)
      throw new Error('Failed to startup joola.io');
  });
  }
  catch(ex)
  {
    console.log(ex);
    console.log(ex.stack);
    throw ex;
  }
});

after(function (done) {
  process.env.NODE_ENV = orig_env;
  done();
});
