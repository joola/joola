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

exports.insert = {
  name: "/api/beacon/insert",
  description: "",
  inputs: ['collection', 'document'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'beacon:insert'
  },
  run: function (collection, document, callback) {
    callback = callback || emptyfunc;

    return joola.caching.transform(collection, document).insert(collection, document, callback);
  }
};