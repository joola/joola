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
  "_id": "datatable",
  "id": {
    "name": "id",
    "description": "The id of the datatable",
    "type": "string",
    "required": true
  },
  "name": {
    "name": "name",
    "description": "The name of the datatable",
    "type": "string",
    "required": true
  },
  "type": {
    "name": "type",
    "description": "The type of the datatable ",
    "required": true
  },
  "primarykey": {
    "name": "primarykey",
    "description": "The primary key of the data table",
    "required": true
  },
  "dates": {
    "name": "dates",
    "description": "The date columns of the table",
    "required": false
  },
  "dimensions": {
    "name": "dimensions",
    "description": "The date dimensions of the table",
    "required": false
  },
  "metrics": {
    "name": "metrics",
    "description": "The date metrics of the table",
    "required": false
  }
};

var Datatable = module.exports = function (options) {
  this._proto = proto;
  this._super = {};
  for (var x in require('./base')) {
    this[x] = require('./base')[x];
    this._super[x] = require('./base')[x];
  }

  if (!this.validate(options))
    throw new Error('Failed to verify new datasource');

  return options;
};

Datatable.proto = proto;