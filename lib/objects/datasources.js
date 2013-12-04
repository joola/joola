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
    if (err)
      return joola.dispatch.emit('datasources:list-done', {err: err});

    if (typeof value === 'undefined')
      value = {};
    joola.dispatch.emit('datasources:list-done', {err: null, message: value});
    return callback(value);
  });
};

datasources.add = function (datasource, callback) {
  joola.config.get('datasources', function (err, value) {
    if (err)
      return joola.dispatch.emit('datasources', 'add-done', {err: err});

    var _datasources;
    if (!value)
      _datasources = {};
    else
      _datasources = value;
    _datasources[datasource.name] = datasource;

    joola.config.set('datasources', _datasources, function (err) {
      if (err)
        return joola.dispatch.emit('datasources', 'add-done', {err: err});

      return joola.dispatch.emit('datasources', 'add-done', {err: null, message: datasource});
    });
  });
};

datasources.update = function (datasource, callback) {
  console.log('UPDATE');
  joola.config.get('datasources', function (err, value) {
    if (err)
      return joola.dispatch.emit('datasources', 'update-done', {err: err});

    var _datasources;
    if (!value)
      _datasources = {};
    else
      _datasources = value;
    _datasources[datasource.name] = datasource;

    joola.config.set('datasources', _datasources, function (err) {
      if (err) {
        console.log('ERROR', err);
        return joola.dispatch.emit('datasources', 'update-done', {err: err});
      }
      console.log('ds', datasource);
      return joola.dispatch.emit('datasources', 'update-done', {err: null, message: datasource});
    });
  });
};

datasources.delete = function (datasource, callback) {
  joola.config.get('datasources', function (err, value) {
    if (err)
      return joola.dispatch.emit('datasources', 'delete-done', {err: err});

    var _datasources;
    if (!value)
      _datasources = {};
    else
      _datasources = value;
    delete _datasources[datasource.name];

    joola.config.set('datasources', _datasources, function (err) {
      if (err)
        return joola.dispatch.emit('datasources', 'delete-done', {err: err});

      return joola.dispatch.emit('datasources', 'delete-done', {err: null, message: datasource});
    });
  });
};