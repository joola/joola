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

exports.status = {
  name: "/api/etl/status",
  description: "",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'etl:status'
  },
  run: function (callback) {
    callback = callback || emptyfunc;

    return joola.etl.status(callback);
  }
};

exports.allocate = {
  name: "/api/etl/allocate",
  description: "",
  inputs: ['options'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'etl:allocate'
  },
  run: function (options, callback) {
    callback = callback || emptyfunc;

    return joola.etl.allocate(options, callback);
  }
};
