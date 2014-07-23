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
    "description": "The key of the workspace",
    "type": "string",
    "required": true
  },
	"name": {
		"name": "name",
		"description": "The name of the workspace",
		"type": "string",
		"required": false
	},
  "description": {
    "name": "description",
    "description": "The description of the workspace",
    "type": "string",
    "required": false
  }
};

var workspace = module.exports = function (options) {
	this._proto = proto;
	this._super = {};
	for (var x in require('./base')) {
		this[x] = require('./base')[x];
		this._super[x] = require('./base')[x];
	}
	var validationErrors = this.validate(options);

	if (validationErrors.length > 0)
		throw new Error('Failed to verify new workspace, fields: [' + validationErrors.join(',') + ']');

	return options;
};

workspace.proto = proto;