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
  url = require('url');

var config = exports;
config._id = 'config';

config.init = function (callback) {
  joolaio.events.emit('config.init.start');
  var self = this;
  var loadLocal = function (callback) {
    joolaio.common.extend(joolaio.options, require('../config/config.json'));
    return self.verify(callback);
  };

  //if in browser, first try to get values from url
  if (joolaio.options.isBrowser) {
    var location = window.location;
    var query = url.parse(location.href, true).query;
    if (Object.keys(query).length > 0) {
      var recurParseStringToObject = function (string, value, path, level, final) {
        var key;
        if (string.indexOf('.') > -1) {
          key = string.substring(0, string.indexOf('.'));
          path += '{"' + key + '":';
        }
        else {
          key = string;
          path += '{"' + key + '":"' + value + '"}';
          for (var i = 0; i < level; i++)
            path += '}';
          final = true;
        }
        if (final)
          return JSON.parse(path);
        string = string.substring(string.indexOf('.') + 1, string.length);
        return recurParseStringToObject(string, value, path, level + 1, final);
      };

      var _query = {};
      Object.keys(query).forEach(function (part) {
        var key = part;
        var value = query[part];
        if (key.indexOf('.') > -1) {
          key = recurParseStringToObject(key, value, '', 0);
          joolaio.common.mixin(_query, key);
        }
        else
          _query[key] = value;
      });

      query = _query;
      joolaio.common.extend(joolaio.options, query);
    }
    else {
      return loadLocal(function(){
        joolaio.events.emit('config.init.finish');
        return callback.apply(this,arguments);
      });
    }
  }
  else {
    //default behavior, load local config
    return loadLocal(function(){
      joolaio.events.emit('config.init.finish');
      return callback.apply(this,arguments);
    });
  }

  this.verify(function(){
    joolaio.events.emit('config.init.finish');
    return callback.apply(this,arguments);
  });
};

config.verify = function (callback) {
  joolaio.events.emit('config.verify.start');

  if (!joolaio.options.version)
    return callback(new Error('Failed to verify configuration'));

  joolaio.events.emit('config.verify.finish');
  return callback(null);
};