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

var joola = require('../../joola');
var proto = {
  "key": {
    "name": "key",
    "description": "The key of the role",
    "type": "string",
    "required": true
  },
  "permissions": {
    "name": "permissions",
    "description": "List of permissions assosciated with this role",
    "required": true,
    "default": [],
    "private": true
  },
  "filter": {
    "name": "filter",
    "description": "List of filters for the specified role",
    "required": false,
    "default": [],
    "private": true
  }
};

var Role = module.exports = function (options) {
  this._proto = proto;
  this._super = {};
  for (var x in require('./base')) {
    this[x] = require('./base')[x];
    this._super[x] = require('./base')[x];
  }
  var validationErrors = this.validate(options);

  if (validationErrors.length > 0)
    throw new Error('Failed to verify new role [' + options.key + '], fields: [' + validationErrors.join(',') + ']');

  if (!Array.isArray(options.permissions))
    options.permissions = options.permissions.split(',');
  return options;
};

Role.proto = proto;