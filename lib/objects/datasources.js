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

var datasources = exports;

datasources.list = function (callback) {
  callback = callback || emptyfunc;
  joola.config.get('datasources', function (err, value) {
    if (err) {
      joola.dispatch.emit('datasources:list-done', {err: err});
      return callback(err);
    }

    if (typeof value === 'undefined')
      value = {};

    joola.dispatch.emit('datasources:list-done', {err: null, message: value});
    return callback(null, value);
  });
};

datasources.add = function (datasource, callback) {
  callback = callback || emptyfunc;

  joola.config.get('datasources', function (err, value) {
    if (err) {
      joola.dispatch.emit('datasources:add-done', {err: err});
      return callback(err);
    }

    var _datasources;
    if (!value)
      _datasources = {};
    else
      _datasources = value;
    _datasources[datasource.name] = datasource;
    joola.config.set('datasources', _datasources, function (err) {
      if (err)
        joola.dispatch.emit('datasources:add-done', {err: err});
      else
        joola.dispatch.emit('datasources:add-done', {err: null, message: datasource});

      return callback(err, datasource);
    });
  });
};

datasources.update = function (datasource, callback) {
  callback = callback || emptyfunc;

  joola.config.get('datasources', function (err, value) {
    if (err) {
      joola.dispatch.emit('datasources:update-done', {err: err});
      return callback(err);
    }

    var _datasources;
    if (!value)
      _datasources = {};
    else
      _datasources = value;
    _datasources[datasource.name] = datasource;

    joola.config.set('datasources', _datasources, function (err) {
      if (err)
        joola.dispatch.emit('datasources:update-done', {err: err});
      else
        joola.dispatch.emit('datasources:update-done', {err: null, message: datasource});

      return callback(err, datasource);
    });
  });
};

datasources.delete = function (datasource, callback) {
  callback = callback || emptyfunc;

  joola.config.get('datasources', function (err, value) {
    if (err) {
      joola.dispatch.emit('datasources:delete-done', {err: err});
      return callback(err);
    }

    joola.config.redis.expire('datasources:' + datasource.name, 1);
    /*joola.config.set('datasources', _datasources, function (err) {
     if (err)
     joola.dispatch.emit('datasources:delete-done', {err: err});
     else
     joola.dispatch.emit('datasources:delete-done', {err: null, message: datasource});

     return callback(err, datasource);
     });*/
    return callback(err, datasource);
  });
};