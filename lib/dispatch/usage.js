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
  router = require('../webserver/routes/index');

exports.last_write = {
  name: "/usage/last_write",
  description: "",
  verb: 'GET',
  inputs: [],
  _outputExample: {},
  _permission: ['usage:last_write'],
  _dispatch: {
    message: 'usage:last_write'
  },
  run: function (context, callback) {
    callback = callback || function () {
    };

    var user = {
      username: 'user',
      password: 'pass',
      workspace: '_stats',
      roles: ['reader']
    };
    joola.users.generateToken({user: joola.SYSTEM_USER}, user, function (err, token) {
      var query = {
        timeframe: 'last_1_items',
        dimensions: ['timestamp', 'workspace', 'collection'],
        metrics: ['writeCount'],
        collection: 'writes',
        filter: []
      };

      joola.query.fetch({user: token.user}, query, function (err, result) {
        if (err)
          return callback(err);
        if (result.documents && result.documents.length > 0)
          return callback(null, result.documents[0].fvalues);
        else
          return callback(new Error('Failed to locate writes'));
      });
    });
  }
};

exports.last_read = {
  name: "/usage/last_read",
  description: "",
  verb: 'GET',
  inputs: [],
  _outputExample: {},
  _permission: ['usage:last_read'],
  _dispatch: {
    message: 'usage:last_read'
  },
  run: function (context, callback) {
    callback = callback || function () {
    };

    var user = {
      username: 'user',
      password: 'pass',
      workspace: '_stats',
      roles: ['reader']
    };
    joola.users.generateToken({user: joola.SYSTEM_USER}, user, function (err, token) {
      var query = {
        timeframe: 'last_1_items',
        dimensions: ['timestamp'],
        metrics: ['readCount'],
        collection: 'reads',
        filter: []
      };

      joola.query.fetch({user: token.user}, query, function (err, result) {
        if (err)
          return callback(err);
        if (result.documents && result.documents.length > 0)
          return callback(null, result.documents[0].fvalues);
        else
          return callback(new Error('Failed to locate reads'));
      });
    });
  }
};

exports.last_use = {
  name: "/usage/last_use",
  description: "",
  verb: 'GET',
  inputs: [],
  _outputExample: {},
  _permission: ['usage:last_use'],
  _dispatch: {
    message: 'usage:last_use'
  },
  run: function (context, callback) {
    callback = callback || function () {
    };

    exports.last_write.run({user: joola.SYSTEM_USER}, function (err, last_write) {
      console.log('writes', err, last_write);
      if (err)
        return callback(err);
      return exports.last_read.run({user: joola.SYSTEM_USER}, function (err, last_read) {
        console.log('reads', err, last_read);
        if (err)
          return callback(err);

        return callback(null, {
          last_use: last_write.timestamp > last_read.timestamp ? last_write.timestamp : last_read.timestamp
        });
      });
    });
  }
};
