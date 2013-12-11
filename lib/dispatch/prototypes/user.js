/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var proto = {
  "_id": "user",
  "_username": {
    "name": "_username",
    "description": "The user's username",
    "type": "string",
    "required": true
  },
  "displayName": {
    "name": "displayName",
    "description": "The displayname of the user",
    "required": true
  },
  "_email": {
    "name": "_email",
    "description": "The user's email address",
    "required": true
  },
  "_password": {
    "name": "_password",
    "description": "The user's password",
    "required": true
  },
  "_roles": {
    "name": "_roles",
    "description": "The user's roles",
    "required": true
  },
  "_filter": {
    "name": "_filter",
    "description": "The user's filter",
    "required": true
  }
};

var User = module.exports = function (options) {
  this._proto = proto;
  this._super = {};
  for (var x in require('./base')) {
    this[x] = require('./base')[x];
    this._super[x] = require('./base')[x];
  }
  if (!this.validate(options))
    throw new Error('Failed to verify new user');

  return options;
};

User.proto = proto;