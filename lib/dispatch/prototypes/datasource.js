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
	"dbhost": {
		"name": "dbhost",
		"description": "dbhost",
		"required": true
	},
	"dbport": {
		"name": "dbport",
		"description": "dbport",
		"required": true
	},
	"dbname": {
		"name": "dbname",
		"description": "dbname",
		"required": true
	},
	"dbuser": {
		"name": "dbuser",
		"description": "dbuser",
		"required": true
	},
	"dbpass": {
		"name": "dbpass",
		"description": "dbpass",
		"required": true
	}
};

var Datasource = module.exports = function (options) {
	this._proto = proto;
	this._super = {};
	for (var x in require('./base')) {
		this[x] = require('./base')[x];
		this._super[x] = require('./base')[x];
	}
	var validationErrors = this.validate(options);

	if (validationErrors.length > 0)
		throw new Error('Failed to verify new data source, fields: [' + validationErrors.join(',') + ']');

	return options;
};

Datasource.proto = proto;