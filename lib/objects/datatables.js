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

var datatables = exports;

datatables.list = function (callback) {
  callback = callback || emptyfunc;
  joola.config.get('datatables', function (err, value) {
    if (err) {
      joola.dispatch.emit('datatables:list-done', {err: err});
      return callback(err);
    }

    if (typeof value === 'undefined')
      value = {};

    joola.dispatch.emit('datatables:list-done', {err: null, message: value});
    return callback(null, value);
  });
};

datatables.add = function (datatable, callback) {
  callback = callback || emptyfunc;

  joola.config.get('datatables', function (err, value) {
    if (err) {
      joola.dispatch.emit('datatables:add-done', {err: err});
      return callback(err);
    }

    var _datatables;
    if (!value)
      _datatables = {};
    else
      _datatables = value;
    _datatables[datatable.name] = datatable;
    joola.config.set('datatables', _datatables, function (err) {
      if (err)
        joola.dispatch.emit('datatables:add-done', {err: err});
      else
        joola.dispatch.emit('datatables:add-done', {err: null, message: datatable});

      return callback(err, datatable);
    });
  });
};

datatables.update = function (datatable, callback) {
  callback = callback || emptyfunc;

  joola.config.get('datatables', function (err, value) {
    if (err) {
      joola.dispatch.emit('datatables:update-done', {err: err});
      return callback(err);
    }

    var _datatables;
    if (!value)
      _datatables = {};
    else
      _datatables = value;
    _datatables[datatable.name] = datatable;

    joola.config.set('datatables', _datatables, function (err) {
      if (err)
        joola.dispatch.emit('datatables:update-done', {err: err});
      else
        joola.dispatch.emit('datatables:update-done', {err: null, message: datatable});

      return callback(err, datatable);
    });
  });
};

datatables.delete = function (datatable, callback) {
  callback = callback || emptyfunc;

  joola.config.get('datatables', function (err, value) {
    if (err) {
      joola.dispatch.emit('datatables:delete-done', {err: err});
      return callback(err);
    }

    joola.config.redis.expire('datatables:' + datatable.name, 1);
    /*joola.config.set('datasources', _datasources, function (err) {
     if (err)
     joola.dispatch.emit('datasources:delete-done', {err: err});
     else
     joola.dispatch.emit('datasources:delete-done', {err: null, message: datasource});

     return callback(err, datasource);
     });*/
    return callback(err, datatable);
  });
};