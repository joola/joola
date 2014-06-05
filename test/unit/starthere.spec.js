/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

before(function (done) {
  var self = this;
  require('../../joola.io.js').init({}, function (err, joola) {
    global.joola = joola;
    if (err)
      return done(err);
    joola.state.once('state:change', function (state) {
      if (state !== 'online')
        return done(new Error('Failed to initialize engine, check logs.'));

      global.joolaio = joola.sdk;
      global.joola_proxy = joola;
      global.uid = joola.common.uuid();
      global.workspace = '_test';
      joolaio.init({host: 'https://127.0.0.1:8081', APIToken: 'apitoken-test', debug: {enabled: true}}, function (err) {
        if (err)
          return done(err);
      });
      joolaio.events.on('ready', function () {
        global.user = joolaio.USER;
        global.user.permissions = [''];
        global._token = {
          user: global.user
        };
        return done();
      });
    });
  });
});

after(function (done) {
  if (joola.shutdown) {
    joola.shutdown(0, function () {
      return done();
    });
  }
  else
    return done();
});
