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
  //"_id": "metric",
  "key": {
    "name": "key",
    "description": "The id of the metric",
    "type": "string",
    "required": true
  },
  "name": {
    "name": "name",
    "description": "The name of the metric",
    "type": "string",
    "required": true
  },
  "description": {
    "name": "description",
    "description": "The description of the metric",
    "type": "string",
    "required": false,
    "default": ""
  },
  "type": {
    "name": "type",
    "description": "The type of the metric",
    "type": "string",
    "required": true,
    "private": true,
    "hidden": true
  },
  "filter": {
    "name": "filter",
    "description": "The filter of the metric",
    "type": "array",
    "required": false,
    "default": ""
  },
  "datatype": {
    "name": "datatype",
    "description": "The datatype of the metric",
    "type": "string",
    "required": false,
    "default": ""
  },
  "aggregation":{
    "name": "aggregation",
    "description": "The aggregation of the metric",
    "type": "string",
    "required": false,
    "default": ""
  },
  "prefix":{
    "name": "prefix",
    "description": "The prefix of the metric",
    "type": "string",
    "required": false,
    "default": ""
  },
  "suffix":{
    "name": "suffix",
    "description": "The suffix of the metric",
    "type": "string",
    "required": false,
    "default": ""
  },
  "decimals":{
    "name": "decimals",
    "description": "The number of decimal places to show",
    "type": "int",
    "required": false,
    "default": 0
  },
  "formula":{
    "name": "formula",
    "description": "The formula of the metric",
    "type": "object",
    "required": false
  },
  "collection":{
    "name": "collection",
    "description": "The collection of the metric",
    "type": "string",
    "required": false
  },
  "category":{
    "name": "category",
    "description": "The category of the metric",
    "type": "string",
    "required": false
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
    throw new Error('Failed to verify new metric, fields: [' + validationErrors.join(',') + ']');

  return options;
};

Proto.proto = proto;