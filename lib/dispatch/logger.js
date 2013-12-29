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
  description: "I fetch all logs",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'logger:fetch'
  },
  run: function (callback) {
    callback = callback || emptyfunc;

    mongo.find('logger', 'events', {}, {sort: {time: -1}, limit: 1000}, function (err, logs) {
      return callback(err, logs);
    });
  }
};
