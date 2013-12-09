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
  router = require('../webserver/routes/index'),
  proto = require('./prototypes/datasource');

exports.list = {
  name: "/api/datasources/list",
  description: "I list all available data sources",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.once('datasources:list-request', function () {
      joola.logger.debug('Listing data sources');
      self.run(function (err, value) {
        if (err)
          return joola.dispatch.emit('datasources:list-done', {err: err});

        joola.dispatch.emit('datasources:list-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    var response = {};
    joola.dispatch.emitWait('datasources:list-request', {}, function (err, datasources) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to list datasources: ' + err), req, res);

      response.datasources = datasources;
      return router.responseSuccess(response, req, res);
    });
  },
  run: function (callback) {
    callback = callback || emptyfunc;
    joola.config.get('datasources', function (err, value) {
      if (err)
        return callback(err);

      if (typeof value === 'undefined')
        value = {};

      return callback(null, value);
    });
  }
};

exports.add = {
  name: "/api/datasources/add",
  description: "I add a new data source",
  inputs: ['datasource'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.once('datasources:add-request', function (channel, ds) {
      joola.logger.debug('New datasource request [' + ds.name + ']');
      self.run(ds, function (err, value) {
        if (err)
          return joola.dispatch.emit('datasources:add-done', {err: err});

        joola.dispatch.emit('datasources:add-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    var response = {};
    try {
      var ds = new proto({
        name: req.params.datasource.name,
        type: req.params.datasource.type,
        _connectionString: req.params.datasource._connectionString,
        stam: req.params.datasource.stam
      });

      joola.dispatch.emitWait('datasources:add-request', ds, function (err, _ds) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to store new datasource: ' + err), req, res);
        response.ds = _ds;
        return router.responseSuccess(response, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (datasource, callback) {
    callback = callback || emptyfunc;

    joola.config.get('datasources', function (err, value) {
      if (err)
        return callback(err);

      var _datasources;
      if (!value)
        _datasources = {};
      else
        _datasources = value;
      _datasources[datasource.name] = datasource;
      joola.config.set('datasources', _datasources, function (err) {
        if (err)
          return callback(err);

        return callback(err, datasource);
      });
    });
  }
};

exports.update = {
  name: "/api/datasources/update",
  description: "I update an existing data source",
  inputs: ['datasource'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.once('datasources:update-request', function (channel, ds) {
      joola.logger.debug('datasource update request [' + ds.name + ']');
      self.run(ds, function (err, value) {
        if (err)
          return joola.dispatch.emit('datasources:update-done', {err: err});

        joola.dispatch.emit('datasources:update-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    var response = {};
    try {
      var ds = new proto({
        name: req.params.datasource.name,
        type: req.params.datasource.type,
        _connectionString: req.params.datasource._connectionString,
        stam: req.params.datasource.stam
      });

      joola.dispatch.emitWait('datasources:update-request', ds, function (err, _ds) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to update datasource: ' + err), req, res);
        response.ds = _ds;
        return router.responseSuccess(response, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (datasource, callback) {
    callback = callback || emptyfunc;

    joola.config.get('datasources', function (err, value) {
      if (err)
        return callback(err);

      var _datasources;
      if (!value)
        _datasources = {};
      else
        _datasources = value;
      _datasources[datasource.name] = datasource;

      joola.config.set('datasources', _datasources, function (err) {
        if (err)
          return callback(err);

        return callback(err, datasource);
      });
    });
  }
};

exports.delete = {
  name: "/api/datasources/delete",
  description: "I delete an existing data source",
  inputs: ['datasource'],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.once('datasources:delete-request', function (channel, ds) {
      joola.logger.debug('datasource delete request [' + ds.name + ']');
      self.run(ds, function (err, value) {
        if (err)
          return joola.dispatch.emit('datasources:delete-done', {err: err});

        joola.dispatch.emit('datasources:delete-done', {err: null, message: value});
      });
    });
  },
  route: function (req, res) {
    var response = {};
    try {
      var ds = new proto({
        name: req.params.datasource.name,
        type: req.params.datasource.type,
        _connectionString: req.params.datasource._connectionString,
        stam: req.params.datasource.stam
      });

      joola.dispatch.emitWait('datasources:delete-request', ds, function (err, _ds) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to delete datasource: ' + err), req, res);
        response.ds = _ds;
        return router.responseSuccess(response, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  },
  run: function (datasource, callback) {
    callback = callback || emptyfunc;

    joola.config.get('datasources', function (err, value) {
      if (err)
        return callback(err);

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
  }
};