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
  "_id": "metric",
  "datatable": {
    "name": "datatable",
    "description": "The id of the datatable holding this metric",
    "required": false
  },
  "dimension": {
    "name": "dimension",
    "description": "The id of the dimension to base the metric on",
    "required": false
  },
  "metric": {
    "name": "metric",
    "description": "The id of the metric to base the metric on",
    "required": false
  },
  "id": {
    "name": "id",
    "description": "The id of the metric",
    "required": true
  },
  "name": {
    "name": "name",
    "description": "The name of the metric",
    "required": true
  },
  "description": {
    "name": "description",
    "description": "The description of the metric",
    "required": false
  },
  "type": {
    "name": "type",
    "description": "The type of the metric",
    "required": true
  },
  "virtual": {
    "name": "virtual",
    "description": "Is this a virtual metric?",
    "default": false,
    "required": false
  },
  "visible": {
    "name": "visible",
    "description": "Is this metric visible?",
    "default": true,
    "required": false
  },
  "deleted": {
    "name": "deleted",
    "description": "Is this metric visible?",
    "default": false,
    "required": false
  },
  "column": {
    "name": "column",
    "description": "The data table's column name",
    "required": true
  },
  "aggregation": {
    "name": "aggregation",
    "description": "The aggregation to use on the metric.",
    "required": true
  },
  "prefix": {
    "name": "prefix",
    "description": "The prefix to add to the metric display.",
    "required": false
  },
  "suffix": {
    "name": "suffix",
    "description": "The suffix to add to the metric display.",
    "required": false
  },
  "formula": {
    "name": "formula",
    "description": "The formula used to calculate this metric.",
    "required": false
  },
  "ratiodirection": {
    "name": "ratiodirection",
    "description": "Indicator to the good/bad ratio direction.",
    "required": false
  },
  "roles": {
    "name": "roles",
    "description": "What roles are allowed to access this metric",
    "required": true
  },
  "category": {
    "name": "category",
    "description": "What category this metric belongs to",
    "required": true
  }
};

var Metric = module.exports = function (options) {
  this._proto = proto;
  this._super = {};
  for (var x in require('./base')) {
    this[x] = require('./base')[x];
    this._super[x] = require('./base')[x];
  }
  var validationErrors = this.validate(options);

  if (validationErrors.length > 0)
    throw new Error('Failed to verify metric, fields: [' + validationErrors.join(',') + ']');

  if (!options.virtual && !options.datatable)
    throw new Error('metric is not virtual, but no table specified.');

  joola.dispatch.datatables.get(options.datatable, function (err, dt) {
    if (err)
      throw err;
    //options.datatable = dt;
  });

  return options;
};

Metric.proto = proto;