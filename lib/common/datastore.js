/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  joola = require('../joola'),
  Embedded = require('joola.datastore-embedded'),

  domain = require('domain'),
  async = require('async'),
  _ = require('underscore');

var datastore = module.exports;

datastore.providers = {};

datastore.init = function (callback) {
  //find out what datastores we have in config
  var stores = joola.config.get('store:datastore');
  var enabledStores = {};

  Object.keys(stores).forEach(function (key) {
    var store = stores[key];
    var enabled = true;
    if (store.hasOwnProperty('enabled'))
      enabled = store.enabled;
    if (enabled)
      enabledStores[key] = store;
  });
  /* istanbul ignore if */
  if (Object.keys(enabledStores).length === 0) {
    return new Embedded({}, {logger: joola.logger, common: joola.common, memory: joola.memory}, function (err, provider) {
      if (err)
        return callback(err);
      joola.logger.debug('Datastore [embedded] is now ready.');
      datastore.providers.embedded = provider;
      datastore.providers.default = datastore.providers.default || provider;

      return callback(null, enabledStores);
    });
  }
  else {
    var calls = [];
    Object.keys(enabledStores).forEach(function (key) {
      var store = stores[key];
      try {
        var call = function (callback) {
          var Provider = require('joola.datastore-' + key);
          /* istanbul ignore if */
          if (!Provider)
            return callback(new Error('Provider [' + key + '] cannot be required. Did you forget to `npm install` it?'));

          joola.logger.trace('Initializing datastore provider [' + key + '].');
          new Provider(store, {
            logger: joola.logger,
            common: joola.common,
            memory: joola.memory
          }, function (err, provider) {
            /* istanbul ignore if */
            if (err)
              return callback(err);
            joola.logger.debug('Datastore [' + key + '] is now ready.');
            datastore.providers[key] = provider;
            datastore.providers.default = datastore.providers.default || provider;
            return callback(null, provider);
          });
        };
        calls.push(call);
      }
      catch (ex) {
        /* istanbul ignore next */
        return callback(ex);
      }
    });

    async.series(calls, function (err) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      return callback(null, enabledStores);
    });
  }
};

datastore.destroy = function (callback) {
  var calls = [];
  Object.keys(datastore.providers).forEach(function (key) {
    var call = function (callback) {
      joola.logger.trace('Destroying datastore provider [' + key + '].');
      var provider = datastore.providers[key];
      provider.destroy(callback);
    };
    if (key !== 'default')
      calls.push(call);
  });
  async.series(calls, function (err) {
    /* istanbul ignore if */
    if (err)
      return callback(err);
    return callback(null);
  });
};