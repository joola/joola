/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

var
async = require('async'),
  path = require('path'),
  fs = require('fs');

before(function(done) {
  var self = this;
  try {
    //make sure we start the test without any residue json configuration
    fs.unlinkSync(path.join(__dirname, '../', 'config', 'local.json'));
  } catch (ex) {

  }
  require('../../joola.js').init({}, function(err, engine) {
    if (err)
      return done(err);
    engine.state.once('state:change', function(state) {
      if (state !== 'online')
        return done(new Error('Failed to initialize engine, check logs.'));

      engine.config.set('authentication:basicauth:enabled', true);

      global.engine = engine;
      global.joola = require('joola.sdk');
      global.joola_proxy = engine;
      global.uid = engine.common.uuid();
      global.workspace = '_test';
      joola.init({
        host: 'http://127.0.0.1:8080',
        APIToken: 'apitoken-test',
        debug: {
          enabled: false
        }
      }, function(err) {
        if (err)
          return done(err);
      });
      joola.events.on('ready', function() {
        global.user = joola.USER;
        global.user.permissions = ['superuser'];
        global._token = {
          user: global.user
        };
        return done();
      });
    });
  });
});

after(function(done) {
  //try to delete any left over collections
  var context = {
    user: _token.user
  };
  var collections = []
  collections.push('test-collection-basic-' + global.uid);
  collections.push('test-collection-basic-' + global.uid + '-date-field');
  collections.push('test-collection-basic-' + global.uid + '-nots');
  //collections.push('test-collection-collectionstest-' + global.uid);
  collections.push('test-collection-nested-' + global.uid);
  collections.push('test-beacon-route-' + global.uid);
  collections.push('collection-592');
  //collections.push('test-collection-592');
  async.mapSeries(collections, function(c, cb) {
    engine.collections.delete(context, context.user.workspace, c, function(err) {
      //allow errors
      return cb(null);
    });
  }, function(err) {
    if (engine.shutdown) {
      engine.shutdown(0, function() {
        return done();
      });
    } else
      return done();
  });
});
