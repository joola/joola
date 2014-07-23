/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

before(function (done) {
  var self = this;
  require('../../joola.js').init({}, function (err, engine) {
    if (err)
      return done(err);
    engine.state.once('state:change', function (state) {
      if (state !== 'online')
        return done(new Error('Failed to initialize engine, check logs.'));

      engine.config.set('authentication:basicauth:enabled', true);

      global.engine = engine;
      global.joola = engine.sdk;
      global.joola_proxy = engine;
      global.uid = engine.common.uuid();
      global.workspace = '_test';
      joola.init({host: 'https://127.0.0.1:8081', APIToken: 'apitoken-test', debug: {enabled: true}}, function (err) {
        if (err)
          return done(err);
      });
      joola.events.on('ready', function () {
        global.user = joola.USER;
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
  if (engine.shutdown) {
    engine.shutdown(0, function () {
      return done();
    });
  }
  else
    return done();
});
