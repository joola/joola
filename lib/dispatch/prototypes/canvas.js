/**
 *  @title joola.io
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
  //"_id": "canvas",
  "key": {
    "name": "key",
    "description": "The id of the canvas",
    "type": "string",
    "required": true
  },
  "version": {
    "name": "version",
    "description": "The version of the canvas",
    "type": "string",
    "required": false
  },
  "name": {
    "name": "name",
    "description": "The name of the canvas",
    "type": "string",
    "required": true
  },
  "description": {
    "name": "description",
    "description": "The description of the canvas",
    "type": "string",
    "required": false,
    "default": ""
  },
  "type": {
    "name": "type",
    "description": "The type of the canvas",
    "type": "string",
    "required": true
  },
  "datepicker": {
    "name": "datepicker",
    "description": "The datepicker of the canvas",
    "type": "string"
  },
  "visualizations": {
    "name": "visualizations",
    "description": "The visualizations of the canvas",
    "type": "array"
  },
  "dimensions": {
    "name": "dimensions",
    "description": "The dimensions of the canvas",
    "type": "array"
  },
  "metrics": {
    "name": "metrics",
    "description": "The metrics of the canvas",
    "type": "array"
  },
  "ordinal": {
    "name": "ordinal",
    "description": "The ordinal of the canvas",
    "type": "number"
  },
  "filterbox": {
    "name": "filterbox",
    "description": "The filterbox of the canvas",
    "type": "object"
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
    throw new Error('Failed to verify new canvas, fields: [' + validationErrors.join(',') + ']');

  options.name = options.name || options.key;

  return options;
};

Proto.proto = proto;