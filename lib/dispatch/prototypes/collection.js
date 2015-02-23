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
  //"_id": "collection",
  "key": {
    "name": "key",
    "description": "The id of the collection",
    "type": "string",
    "required": true
  },
  "name": {
    "name": "name",
    "description": "The name of the collection",
    "type": "string",
    "required": true
  },
  "description": {
    "name": "description",
    "description": "The description of the collection",
    "type": "string",
    "required": false,
    "default": ""
  },
  "strongTyped": {
    "name": "strongTyped",
    "description": "Is the collection strong typed",
    "type": "boolean",
    "required": false,
    "default": false
  },
  "dimensions": {
    "name": "dimensions",
    "description": "The collection's dimensions",
    "type": "array",
    "required": false,
    "default": []
  },
  "metrics": {
    "name": "metrics",
    "description": "The collection's metrics",
    "type": "array",
    "required": false,
    "default": []
  }
};

var Proto = module.exports = function (options) {
  this._proto = proto;
  this._super = {};
  for (var x in require('./base')) {
    this[x] = require('./base')[x];
    this._super[x] = require('./base')[x];
  }
  var validationErrors = this.validate(options);

  if (validationErrors.length > 0) {
    throw new Error('Failed to verify new collection, fields: [' + validationErrors.join(',') + ']');
  }

  return options;
};

Proto.proto = proto;