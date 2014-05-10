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

  mongo = require('../common/mongo'),
  router = require('../webserver/routes/index');

exports.fetch = {
  name: "/logger/fetch",
  description: "I fetch logs from a certain timestamp",
  inputs: {
    required: [],
    optional: ['query']
  },
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'logger:fetch'
  },
  run: function (context, query, callback) {
    if (typeof query === 'function') {
      callback = query;
      query = null;
    }
    callback = callback || function(){};
    mongo.find('logger', 'events', query, {sort: {time: -1}, limit: 10}, function (err, logs) {
      return callback(err, logs);
    });
  }
};

exports.fetchSince = {
  name: "/logger/fetchSince",
  description: "I fetch logs from a certain timestamp",
  inputs: ['start_ts'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'logger:fetchSince'
  },
  run: function (context, start_ts, callback) {
    callback = callback || function(){};

    mongo.find('logger', 'events', {time: {$gt: new Date(start_ts)}}, {sort: {time: 1}, limit: 20}, function (err, logs) {
      return callback(err, logs);
    });
  }
};

exports.fetchUntil = {
  name: "/logger/fetchUntil",
  description: "I fetch logs from a certain timestamp",
  inputs: ['end_ts'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'logger:fetchUntil'
  },
  run: function (context, end_ts, callback) {
    callback = callback || function(){};

    mongo.find('logger', 'events', {time: {$lt: new Date(end_ts)}}, {sort: {time: -1}, limit: 100}, function (err, logs) {
      return callback(err, logs);
    });
  }
};
