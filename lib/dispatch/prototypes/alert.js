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
  "_id": "alert",
  "id": {
    "name": "id",
    "description": "The id of the alert",
    "required": true
  },
  "description": {
    "name": "description",
    "description": "The description of the alert",
    "required": false
  },
  "type": {
    "name": "type",
    "description": "The type of the alert",
    "required": true
  },
  "endpoint": {
    "name": "endpoint",
    "description": "Alert's endpoint",
    "required": true
  },
  "query": {
    "name": "query",
    "description": "Alert's query",
    "required": true
  }
};

var Alert = module.exports = function (options) {
  this._proto = proto;
  this._super = {};
  for (var x in require('./base')) {
    this[x] = require('./base')[x];
    this._super[x] = require('./base')[x];
  }
  var validationErrors = this.validate(options);

  if (validationErrors.length > 0)
    throw new Error('Failed to verify alert, fields: [' + validationErrors.join(',') + ']');

  return options;
};

Alert.proto = proto;