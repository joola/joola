/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/



var
  mongo = require('../common/mongo'),
  router = require('../webserver/routes/index');

exports.fetch = {
  name: "/api/logger/fetch",
  description: "I fetch logs from a certain timestamp",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'logger:fetch'
  },
  run: function (callback) {
    callback = callback || emptyfunc;

    mongo.find('logger', 'events', {}, {sort: {time: -1}, limit: 100}, function (err, logs) {
      return callback(err, logs);
    });
  }
};

exports.fetchSince = {
  name: "/api/logger/fetchSince",
  description: "I fetch logs from a certain timestamp",
  inputs: ['start_ts'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'logger:fetchSince'
  },
  run: function (start_ts, callback) {
    callback = callback || emptyfunc;

    mongo.find('logger', 'events', {time: {$gt: new Date(start_ts)}}, {sort: {time: 1}, limit: 20}, function (err, logs) {
      return callback(err, logs);
    });
  }
};

exports.fetchUntil = {
  name: "/api/logger/fetchUntil",
  description: "I fetch logs from a certain timestamp",
  inputs: ['end_ts'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'logger:fetchUntil'
  },
  run: function (end_ts, callback) {
    callback = callback || emptyfunc;

    mongo.find('logger', 'events', {time: {$lt: new Date(end_ts)}}, {sort: {time: -1}, limit: 100}, function (err, logs) {
      return callback(err, logs);
    });
  }
};
