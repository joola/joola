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
  "_id": "datasource",
  "name": {
    "name": "name",
    "description": "The name of the datasource",
    "type": "string",
    "required": true
  },
  "type": {
    "name": "type",
    "description": "The type of the datasource (mysql/postgres/etc)",
    "required": true
  },
  "_connectionString": {
    "name": "_connectionString",
    "description": "Connection string for the data source",
    "required": true
  },
  "stam": {
    "name": "stam",
    "description": "The stam param",
    "required": false
  }
};

var Datasource = module.exports = function (options) {
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

Datasource.proto = proto;