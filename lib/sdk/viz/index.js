/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var viz = exports;
viz._id = 'viz';

//pickers
viz.pickers = require('./pickers/index');

//panels

//charts
viz.Timeline = require('./Timeline');

//onscreen
viz.onscreen = [];

viz.stam = function (callback) {
  return viz.pickers.init(callback);
};