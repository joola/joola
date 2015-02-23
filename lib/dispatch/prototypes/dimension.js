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
  //"_id": "dimension",
  "key": {
    "name": "key",
    "description": "The id of the dimension",
    "type": "string",
    "required": true
  },
  "name": {
    "name": "name",
    "description": "The name of the dimension",
    "type": "string",
    "required": true
  },
  "description": {
    "name": "description",
    "description": "The description of the dimension",
    "type": "string",
    "required": false,
    "default": ""
  },
  "type": {
    "name": "type",
    "description": "The type of the dimension",
    "type": "string",
    "required": true,
    "private": true,
    "hidden": true
  },
  "datatype": {
    "name": "datatype",
    "description": "The datatype of the dimension",
    "type": "string",
    "required": false,
    "default": "string"
  },
  "collection": {
    "name": "collection",
    "description": "The collection of the dimension",
    "type": "string",
    "required": false,
    "default": ""
  },
  "visible": {
    "name": "visible",
    "description": "The visibility of the dimension",
    "type": "bool",
    "required": false,
    "default": true
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

  if (validationErrors.length > 0)
    throw new Error('Failed to verify new dimension, fields: [' + validationErrors.join(',') + ']');

  options.name = options.name || options.key;

  return options;
};

Proto.proto = proto;