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

var
  joola = require('../joola'),

  traverse = require('traverse'),
  kindof = require('kindof'),
  dj = require('describe-json'),
  util = require('util'),
  stringify = require('circular-json'),
  crypto = require('crypto'),
  ce = require('cloneextend');

var common = ce.clone(util);
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

          if (joola.options.debug && joola.options.debug.functions && joola.options.debug.functions.enabled && console.time)
            console.time(timeID);
          var result = fn.apply(self, arguments);
          if (joola.options.debug && joola.options.debug.functions && joola.options.debug.functions.enabled && console.time) {
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

common.uuid = function (length) {
  // http://stackoverflow.com/questions/8855687/secure-random-token-in-node-js
  function randomString(length, chars) {
    var charsLength = chars.length;
    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);
    var cursor = 0;
    for (var i = 0; i < length; i++) {
      cursor += randomBytes[i];
      result[i] = chars[cursor % charsLength]
    }
    return result.join('');
  }
  return randomString(length || 32, 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789');
};

common.stringify = function (obj, callback) {
  callback = callback || function () {
  };
  return callback(null, stringify.stringify(obj));
};

common.parse = function (string, callback) {
  return callback(null, JSON.parse(string));
};

common.hash = function (string) {
  return require('crypto').createHash('md5').update(string).digest("hex");
};

common.sanitize = function (obj, proto, leavePrivate) {
  var cleanup = function (elem) {
    var result = {};
    Object.keys(elem).forEach(function (key) {
      if (!leavePrivate) {
        if (proto.hasOwnProperty(key) && !proto[key].hidden && !proto[key].private) {
          result[key] = elem[key];
        }
      }
      else if (proto.hasOwnProperty(key) && !proto[key].hidden) {
        result[key] = elem[key];
      }
    });

    if (!leavePrivate) {
      Object.keys(proto).forEach(function (key) {
        if (!proto[key].hidden && !proto[key].private) {
          if (!result.hasOwnProperty(key)) {
            result[key] = null;
          }
        }
      });
    }

    return result;
  };

  if (proto) {
    if (Array.isArray(obj)) {
      obj.forEach(function (elem, i) {
        obj[i] = cleanup(elem)
      });
    }
    else {
      obj = cleanup(obj);
    }
  }
  else {
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
  }

  return obj;
};

common.obj2array = function (obj) {
  var result = [];
  if (!obj)
    return [];
  if (typeof obj !== 'object')
    return [];
  Object.keys(obj).forEach(function (key) {
    if (Object.keys(obj[key]).length > 0) {
      var elem = {
        key: key
      };
      elem = joola.common.extend(elem, obj[key]);
      result.push(elem);
    }
  });
  return result;
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
    if (Array.isArray(elem) && key === lookup.substring(0, lookup.indexOf('.'))) {
      result = elem;
    }
  });

  return result;
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
          result.push([this.parent.path.join('.'), this.parent.value]);
        }
      }
    }
  });
  return result;
};

common.flatSet = function (obj, property, value) {
  traverse(obj).map(function (x) {
    if (x.path === property)
      this.value = value;
  });
};

common.objToArray = function (obj) {
  var result = [];
  Object.keys(obj).forEach(function (key) {
    result.push(obj[key]);
  });
  return result;
};

common.flatGetSet = function (obj, is, value) {
  if (typeof is == 'string'){
    return common.flatGetSet(obj, is.split('.'), value);
  }
  else if (is.length == 1 && value !== undefined) {
    if (value === null) {
      //console.log('delete',obj, is[0]);
      return delete obj[is[0]];
    }
    else{
      //console.log('set',is[0]);
      return obj[is[0]] = value;
    }
  }
  else if (is.length == 0) {
    if (typeof obj === 'object' && Object.keys(obj).length === 0)
      return null;
    else {
      //check if converted array
      if (typeof obj === 'object' && Object.keys(obj)[0] === '0')
        return common.objToArray(obj);

      return obj;
    }
  }
  else {
    if (typeof obj === 'undefined' || obj === null)
      obj = {};
    if (typeof obj[is[0]] === 'undefined' || obj[is[0]] === null)
      obj[is[0]] = {};
    return common.flatGetSet(obj[is[0]], is.slice(1), value);
  }
};

common.nest = function (obj) {
  function eachKeyValue(obj, fun) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        fun(i, obj[i]);
      }
    }
  }

  var result = {};
  obj.forEach(function (elem) {
    var namespace = elem[0];
    var value = elem[1];
    var parts = namespace.split(".");
    var last = parts.pop();
    var node = result;
    parts.forEach(function (key) {
      node = node[key] = node[key] || {};
    });
    node[last] = value;
  });
  return result;
};