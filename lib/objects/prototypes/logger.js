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
  "_id": "logger",
  "name": {
    "name": "name",
    "description": "name",
    "type": "string",
    "required": true
  },
  "hostname": {
    "name": "hostname",
    "description": "hostname",
    "required": true
  },
  "pid": {
    "name": "pid",
    "description": "pid",
    "required": true
  },
  "level": {
    "name": "level",
    "description": "level",
    "required": true
  },
  "msg": {
    "name": "msg",
    "description": "msg",
    "required": true
  },
  "time": {
    "name": "time",
    "description": "time",
    "required": true
  }
};

var Logger = module.exports = function (options) {
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

Logger.proto = proto;