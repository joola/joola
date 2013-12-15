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
	"_id": "role",
	"name": {
		"name": "name",
		"description": "The name of the organization",
		"type": "string",
		"required": true
	},
	"permissions": {
		"name": "permissions",
		"description": "List of permissions assosciated with this role",
		"required": true
	}
};

var Role = module.exports = function (options) {
	this._proto = proto;
	this._super = {};
	for (var x in require('./base')) {
		this[x] = require('./base')[x];
		this._super[x] = require('./base')[x];
	}
	var validationErrors = this.validate(options);

	if (validationErrors.length > 0)
		throw new Error('Failed to verify new role, fields: [' + validationErrors.join(',') + ']');

	return options;
};

Role.proto = proto;