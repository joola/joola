/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var
  util = require('util');

var common = util;
common._id = 'common ';

module.exports = exports = common;
common.extend = common._extend;

common.mixin = function (origin, add, overwrite) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') return origin;

  var keys = Object.keys(add);
  var i = 0;//keys.length;
  while (i < keys.length) {
    if (origin.hasOwnProperty(keys[i])) {
      if (overwrite)
        origin[keys[i]] = add[keys[i]];
      //else
        //common.extend(origin[keys[i]], add[keys[i]]);

    }
    else
      origin[keys[i]] = add[keys[i]];
    i++;
  }
  return origin;
};

//hook functions for timings
common.hookEvents = function (obj) {
  if (!obj)
    return;
  var name, fn, obj_id;

  if (obj._id)
    obj_id = obj._id;

  for (name in obj) {
    fn = obj[name];
    if (name.substring(0, 1) == '_')
      continue;

    if (typeof fn === 'function' && name !== 'hookEvents') {
      obj[name] = function (name, fn) {
        var args = arguments;
        return function () {
          var self = this;
          var timeID = 'Function ' + (obj_id ? obj_id + '.' : '') + name;

          if (joolaio.options.debug.functions.enabled && console.time)
            console.time(timeID);
          var result = fn.apply(self, arguments);
          if (joolaio.options.debug.functions.enabled && console.time) {
            console.timeEnd(timeID);
          }
          return result;
        };
      }(name, fn);
    }
    else if (typeof fn === 'object')
      this.hookEvents(fn);
  }
};

common.uuid = function () {
  return Math.floor(Math.random() * 10) + parseInt(new Date().getTime()).toString(36).toLowerCase();
};

//prototype additions
Date.prototype.format = function (formatString) {
  var formatDate = this;
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var yyyy = formatDate.getFullYear();
  var yy = yyyy.toString().substring(2);
  var m = formatDate.getMonth() + 1;
  var mm = m < 10 ? "0" + m : m;
  var mmm = months[m - 1];
  var d = formatDate.getDate();
  var dd = d < 10 ? "0" + d : d;
  var fff = formatDate.getMilliseconds().toString();
  fff = (fff < 100 ? fff < 10 ? '00' + fff : +'0' + fff : fff);
  var h = formatDate.getHours();
  var hh = h < 10 ? "0" + h : h;
  var n = formatDate.getMinutes();
  var nn = n < 10 ? "0" + n : n;
  var s = formatDate.getSeconds();
  var ss = s < 10 ? "0" + s : s;

  formatString = formatString.replace(/yyyy/i, yyyy);
  formatString = formatString.replace(/yy/i, yy);
  formatString = formatString.replace(/mmm/i, mmm);
  formatString = formatString.replace(/mm/i, mm);
  formatString = formatString.replace(/m/i, m);
  formatString = formatString.replace(/dd/i, dd);
  formatString = formatString.replace(/d/i, d);
  formatString = formatString.replace(/hh/i, hh);
  //formatString = formatString.replace(/h/i, h);
  formatString = formatString.replace(/nn/i, nn);
  //formatString = formatString.replace(/n/i, n);
  formatString = formatString.replace(/ss/i, ss);
  formatString = formatString.replace(/fff/i, fff);
  //formatString = formatString.replace(/s/i, s);

  return formatString;
};