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

var base = exports;

/**
 * @param {Function} [callback] called following execution with errors and results.
 * Lists all configured data sources:
 *
 * The function calls on completion an optional `callback` with:
 * - `err` if occured, an error object, else null.
 * - `result` contains the list of configured datasource.
 *
 * Configuration elements participating: `config:datasources`.
 *
 * Events raised via `dispatch`: `datasources:list-request`, `datasources:list-done`
 *
 * ```js
 * joola.dispatch.datasources.list(function(err, result) {
 *   console.log(err, result);
 * }
 * ```
 */
base.validate = function (options) {
  var validated = [];
  var proto = this._proto;

  Object.keys(proto).forEach(function (key) {
    if (proto[key].required && (!options.hasOwnProperty(key) || (options.hasOwnProperty(key) && !options[key]))) {
      validated.push(key);
    }
    else if (!options.hasOwnProperty(key)) {
      options[key] = null;
    }
  });
  return validated;
};

base.sanitize = function (obj) {
  var proto = this._proto;
  Object.keys(proto).forEach(function (key) {
    if (!obj.hasOwnProperty(key)) {
      obj[key] = null;
    }
  });
  return obj;
};