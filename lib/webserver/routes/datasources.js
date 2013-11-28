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
  router = require('./index'),
  datasources = require('../../objects/datasources'),
  datasource = require('../../objects/prototypes/datasource');

exports.list = {
  name: "datasources/list",
  description: "I list all available data sources",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};

    joola.dispatch.emit('datasources', 'list-request', {}, function (err, datasources) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to list datasources: ' + err), req, res);

      response.datasources = datasources;
      return router.responseSuccess(response, req, res);
    });
  }
};

exports.add = {
  name: "datasources/add",
  description: "I add a data source",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    try {
     // if (req.params[0] instanceof Object)
      //  req.params = req.params[0];

      var options = {
        name: req.params.name,
        type: req.params.type,
        _connectionString: req.params._connectionString,
        stam: req.params.stam
      };
      var ds = new datasource({
        name: req.params.name,
        type: req.params.type,
        _connectionString: req.params._connectionString,
        stam: req.params.stam
      });

      joola.dispatch.emit('datasources', 'add-request', ds, function (err, _ds) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to store new datasource: ' + err), req, res);
        response.ds = _ds;
        return router.responseSuccess(response, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  }
};


exports.update = {
  name: "datasources/update",
  description: "I update a data source",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    //req.params = req.params[0];
    joola.config.get('datasources', function (err, value) {
      if (err)
        return router.responseError(err, req, res);

      var datasources;
      if (!value)
        return router.responseError(new router.ErrorTemplate('No data sources are defined.'), req, res);

      datasources = value;
      var found = false;
      Object.keys(datasources).forEach(function (key) {
        if (key == req.params.name) {
          found = true;
          var ds = new datasource({
            name: req.params.name,
            type: req.params.type,
            _connectionString: req.params._connectionString,
            stam: req.params.stam
          });
          joola.dispatch.emit('datasources', 'update-request', ds, function (err, _ds) {
            if (err)
              return router.responseError(new router.ErrorTemplate('Failed to update datasource: ' + err), req, res);
            response.ds = _ds;
            return router.responseSuccess(response, req, res);
          });
        }
      });

      if (!found)
        return router.responseError(new router.ErrorTemplate('data source not found.'), req, res);
    });
  }
};

exports.delete = {
  name: "datasources/delete",
  description: "I delete a data source",
  inputs: {
    "required": ["name"],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    //req.params = req.params[0];
    var response = {};
    joola.config.get('datasources', function (err, value) {
      if (err)
        return router.responseError(err, req, res);

      var datasources;
      if (!value)
        return router.responseError(new router.ErrorTemplate('No data sources are defined.'), req, res);

      datasources = value;
      var found = false;
      var ds;
      Object.keys(datasources).forEach(function (key) {
        if (key == req.params.name) {
          found = true;
          ds = datasources[key];
        }
      });

      if (!found)
        return router.responseError(new router.ErrorTemplate('data source not found.'), req, res);

      delete datasources[req.params.name];
      joola.config.set('datasources', datasources, function (err) {
        if (err)
          return router.responseError(err, req, res);

        joola.dispatch.emit('datasources', 'delete', ds);
        return router.responseSuccess(response, req, res);
      });
    });
  }
};

exports.describe = {
  name: "datasources/describe",
  description: "I describe a data source",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    response.datasource = datasource.proto;
    return router.responseSuccess(response, req, res);
  }
};