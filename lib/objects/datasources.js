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
  joola.config.get('datasources', function (err, value) {
    if (err)
      return joola.dispatch.emit('datasources', 'list-done', {err: err});

    return joola.dispatch.emit('datasources', 'list-done', {err: null, message: value});
  });
};

datasources.get = function (id, callback) {
  this.list(function (err, datasources) {
    if (err)
      return callback(err);

    var datasource = _.find(datasources, function (ds) {
      return ds.id.toLowerCase() == datasourceid.toLowerCase();
    });

    if (!datasource)
      return callback(new Error('Failed to find datasource [' + id + ']'));

    return datasource;
  });
};

datasources.add = function (datasource, callback) {
  joola.config.get('datasources', function (err, value) {
    if (err)
      return joola.dispatch.emit('datasources', 'add-done', {err: err});

    var datasources;
    if (!value)
      datasources = {};
    else
      datasources = value;
    datasources[datasource.name] = datasource;

    joola.config.set('datasources', datasources, function (err) {
      if (err)
        return joola.dispatch.emit('datasources', 'add-done', {err: err});

      return joola.dispatch.emit('datasources', 'add-done', {err: null, message: datasource});
    });
  });
};

datasources.update = function (datasource, callback) {
  joola.config.get('datasources', function (err, value) {
    if (err)
      return joola.dispatch.emit('datasources', 'update-done', {err: err});

    var datasources;
    if (!value)
      datasources = {};
    else
      datasources = value;
    datasources[datasource.name] = datasource;

    joola.config.set('datasources', datasources, function (err) {
      if (err)
        return joola.dispatch.emit('datasources', 'update-done', {err: err});

      return joola.dispatch.emit('datasources', 'update-done', {err: null, message: datasource});
    });
  });
};

datasources.delete = function (datasource, callback) {
  joola.config.get('datasources', function (err, value) {
    if (err)
      return joola.dispatch.emit('datasources', 'delete-done', {err: err});

    var datasources;
    if (!value)
      datasources = {};
    else
      datasources = value;
    datasources[datasource.name] = datasource;

    joola.config.set('datasources', datasources, function (err) {
      if (err)
        return joola.dispatch.emit('datasources', 'delete-done', {err: err});

      return joola.dispatch.emit('datasources', 'delete-done', {err: null, message: datasource});
    });
  });
};