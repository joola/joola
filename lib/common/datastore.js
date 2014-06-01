/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  joola = require('../joola.io'),

  domain = require('domain'),
  async = require('async'),
  _ = require('underscore');

var datastore = module.exports;

datastore.providers = {};

datastore.init = function (callback) {
  //find out what datastores we have in config
  var stores = joola.config.get('store:datastore');

  var calls = [];
  Object.keys(stores).forEach(function (key) {
    var store = stores[key];
    try {
      var call = function (callback) {
        var Provider = require('joola.io.datastore-' + key);
        if (!Provider)
          return callback(new Error('Provider [' + key + '] cannot be required. Did you forget to `npm install` it?'));

        joola.logger.trace('Initializing datastore provider [' + key + '].');
        new Provider(store, {logger: joola.logger, common: joola.common}, function (err, provider) {
          if (err)
            return callback(err);
          joola.logger.debug('Datastore [' + key + '] is now ready.');
          datastore.providers[key] = provider;
          return callback(null, provider);
        });
      };
      calls.push(call);
    }
    catch (ex) {
      return callback(ex);
    }
  });

  async.series(calls, function (err) {
    if (err)
      return callback(err);

    return callback(null, stores);
  });
};

datastore.destroy = function (callback) {
  var calls = [];
  Object.keys(datastore.providers).forEach(function (key) {
    var call = function (callback) {
      joola.logger.trace('Destroying datastore provider [' + key + '].');
      var provider = datastore.providers[key];
      provider.destroy(callback);
    };
    calls.push(call);
  });
  async.series(calls, function (err) {
    if (err)
      return callback(err);
    return callback(null);
  });
};