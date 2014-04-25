/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  joola = require('../joola.io'),

  traverse = require('traverse'),
  kindof = require('kindof'),
  dj = require('describe-json'),
  util = require('util'),
  stringify = require('circular-json'),
  ce = require('cloneextend');//,
//JSONStream = require('JSONStream');

var common = util;
common._id = 'common';

module.exports = exports = common;
common.extend = common._extend;

require('./modifiers');

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

  obj.hooked = true;

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

          if (joolaio.options.debug && joolaio.options.debug.functions && joolaio.options.debug.functions.enabled && console.time)
            console.time(timeID);
          var result = fn.apply(self, arguments);
          if (joolaio.options.debug && joolaio.options.debug.functions && joolaio.options.debug.functions.enabled && console.time) {
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
  var uuid = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 9; i++)
    uuid += possible.charAt(Math.floor(Math.random() * possible.length));

  return uuid;
};

common.stringify = function (obj, callback) {
  callback = callback || function () {
  };
  return callback(null, stringify.stringify(obj));
  /*
   var errored = false;
   if (!obj)
   return callback(null, obj);
   try {
   var
   expected = [],
   es = require('event-stream');

   expected.push(obj);
   es.connect(
   es.readArray(expected),
   JSONStream.stringify(),
   es.writeArray(function (err, lines) {
   lines = lines[0];
   lines = lines.substring(2);
   return callback(null, lines);
   })
   ).on('error', function (err) {
   if (!errored) {
   errored = true;
   return callback(err, obj);
   }
   });
   }
   catch (ex) {
   return callback(ex, obj);
   }
   */
};

common.parse = function (string, callback) {
  return callback(null, JSON.parse(string));
  /*
   var errored = false;
   if (!string || string == 'undefined')
   return callback(null, string);
   try {
   var
   expected = [],
   es = require('event-stream');

   expected.push(string);
   es.connect(
   es.readArray(expected),
   JSONStream.parse(/./),
   es.writeArray(function (err, obj) {
   return callback(err, obj[0]);
   })
   ).on('error', function (err) {
   if (!errored) {
   errored = true;
   return callback(err, string);
   }
   });
   }
   catch (ex) {
   return callback(ex, string);
   }
   */
};


/*
 var obj = {test: 123};
 common.stringify(obj, function (err, result) {
 console.log('string', result, JSON.parse(result));

 common.parse(result, function (err, obj2) {
 console.log('obj', obj2);
 process.exit();
 })
 });
 */
common.hash = function (string) {
  return require('crypto').createHash('md5').update(string).digest("hex");
};

common.sanitize = function (obj) {
  if (obj instanceof Object) {
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        //recursive call to scan property
        if (k.substring(0, 1) === '_' && k !== '_')
          delete obj[k];
        else
          common.sanitize(obj[k]);
      }
    }
  }
};

common.typeof = function (obj) {
  if (typeof(obj) == "object") {
    if (obj === null) return "null";
    if (obj.constructor == (new Array).constructor) return "array";
    if (obj.constructor == (new Date).constructor) return "date";
    if (Date.parse(obj)) return "date";
    if (obj.constructor == (new RegExp).constructor) return "regex";
    return "object";
  }
  //else
  //{
  //if (Date.parse(obj)) return "date";
  //}
  return typeof(obj);
};

common.checkNested = function (obj, lookup) {
  var path = lookup.split('.');
  var result = obj;
  for (var i = 0, length = path.length; i < length; ++i) {
    if (result) {
      result = result[path[i]];
    }
  }

  Object.keys(obj).forEach(function (key) {
    if (result)
      return;
    var elem = obj[key];
    if (Array.isArray(elem)) {
      elem = elem[0];
      result = common.checkNested(elem, lookup.substring(lookup.indexOf('.') + 1))
    }
  });

  return result;
};

common.checkNestedArray = function (obj, lookup) {
  var result;
  Object.keys(obj).forEach(function (key) {
    if (result)
      return;
    var elem = obj[key];
    if (Array.isArray(elem)) {
      result = elem;
    }
  });

  return result;
};

common.stats = function (stat) {
  var base = {
    timestamp: new Date(),
    node: joola.UID
  };

  var _doc = ce.extend(base, stat);
  joola.beacon.insert(joola.ROOT, 'root', 'stats-' + _doc.event, _doc, {}, function (err) {
    if (err)
      joola.logger.trace('Error while saving stats: ' + err);
  });
};

common.flatten = function (obj) {
  var result = [];
  traverse(obj).map(function (x) {
    if (kindof(x) === 'array' && !this.isRoot) {
      this.array = true;
      this.value = x;
    }
    if (kindof(x) !== 'object') {
      if (kindof(x) === 'array') {

      }
      else if (this.parent && !this.parent.array)
        result.push([this.path.join('.'), x]);
      else if (this.parent && this.parent.array) {
        if (!this.parent.handled) {
          this.parent.handled = true;
          var _flatten = dj.flatten(this.parent.value);
          var batched = [];
          _flatten.forEach(function (f) {
            batched.push([f[1], f[2]]);
          });

          result.push([this.parent.path.join('.'), this.value]);
        }
      }
      //else
      //  result.push([this.path.join('.'), x, kindof(x)]);
    }
  });
  return result;
};

common.flatSet = function (obj, property, value) {
  traverse(obj).map(function (x) {
    console.log(x.path)
    if (x.path === property)
      this.value = value;
  });
};

common.flatGetSet = function (obj, is, value) {
  if (typeof is == 'string')
    return common.flatGetSet (obj, is.split('.'), value);
  else if (is.length == 1 && value !== undefined)
    return obj[is[0]] = value;
  else if (is.length == 0)
    return obj;
  else{
    return common.flatGetSet (obj[is[0]], is.slice(1), value);
  }
};