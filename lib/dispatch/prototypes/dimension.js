/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

var joola = require('../../joola.io');
var proto = {
  "_id": "dimension",
  "datatable": {
    "name": "datatable",
    "description": "The id of the datatable holding this dimension",
    "required": false
  },
  "id": {
    "name": "id",
    "description": "The id of the dimension",
    "required": true
  },
  "name": {
    "name": "name",
    "description": "The name of the dimension",
    "required": true
  },
  "description": {
    "name": "description",
    "description": "The description of the dimension",
    "required": false
  },
  "type": {
    "name": "type",
    "description": "The type of the dimension (default: string)",
    "default": "string",
    "required": false
  },
  "virtual": {
    "name": "virtual",
    "description": "Is this a virtual dimension?",
    "default": false,
    "required": false
  },
  "visible": {
    "name": "visible",
    "description": "Is this dimension visible?",
    "default": true,
    "required": false
  },
  "deleted": {
    "name": "deleted",
    "description": "Is this dimension visible?",
    "default": false,
    "required": false
  },
  "roles": {
    "name": "roles",
    "description": "What roles are allowed to access this dimension",
    "required": true
  },
  "category": {
    "name": "category",
    "description": "The category of the dimension",
    "required": false
  }
};

var Dimension = module.exports = function (options) {
  this._proto = proto;
  this._super = {};
  for (var x in require('./base')) {
    this[x] = require('./base')[x];
    this._super[x] = require('./base')[x];
  }
  var validationErrors = this.validate(options);

  if (validationErrors.length > 0)
    throw new Error('Failed to verify dimension, fields: [' + validationErrors.join(',') + ']');

  if (!options.virtual && !options.datatable)
    throw new Error('Dimension is not virtual, but no table specified.');

  joola.dispatch.datatables.get(options.datatable, function (err, dt) {
    if (err)
      throw err;
    //options.datatable = dt;
  });

  return options;
};

Dimension.proto = proto;