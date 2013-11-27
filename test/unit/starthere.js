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
  process.env.NODE_ENV = 'test';
  //process.env.repl = true;
  _joolaio = require('../../joola.io.js');
  joola.state.on('state:change', function (state) {
    if (state == 'working') {
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
    else
      throw new Error('Failed to startup joola.io');
  });
});

after(function (done) {
  process.env.NODE_ENV = orig_env;
  done();
});
