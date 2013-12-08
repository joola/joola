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
  router = require('./../index'),
  datatables = require('../../../objects/datatables'),
  datatable = require('../../../objects/prototypes/datatable');

exports.list = {
  name: "/api/datatables/list",
  description: "I list all available data tables",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    joola.dispatch.emitWait('datatables:list-request', {}, function (err, datatables) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to list datatables: ' + err), req, res);

      response.datatables = datatables;
      return router.responseSuccess(response, req, res);
    });
  }
};

exports.add = {
  name: "/api/datatables/add",
  description: "I add a data table",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    try {
      var dt = new datatable({
        id: req.params.id,
        name: req.params.name,
        type: req.params.type,
        primarykey: req.params.primarykey,
        dates: req.params.dates,
        metrics: req.params.metrics,
        dimensions: req.params.dimensions
      });

      joola.dispatch.emitWait('datatables:add-request', dt, function (err, _dt) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to store new datatable: ' + err), req, res);
        response.dt = _dt;
        return router.responseSuccess(response, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  }
};

exports.update = {
  name: "/api/datatables/update",
  description: "I update a data table",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    joola.config.get('datatables', function (err, value) {
      if (err)
        return router.responseError(err, req, res);

      var datatables;
      if (!value)
        return router.responseError(new router.ErrorTemplate('No data tables are defined.'), req, res);

      datatables = value;
      var found = false;
      Object.keys(datatables).forEach(function (key) {
        if (key == req.params.name) {
          found = true;
          try {
            var dt = new datatable({
              id: req.params.id,
              name: req.params.name,
              type: req.params.type,
              primarykey: req.params.primarykey,
              dates: req.params.dates,
              metrics: req.params.metrics,
              dimensions: req.params.dimensions
            });

            joola.dispatch.emitWait('datatables:update-request', dt, function (err, _dt) {
              if (err)
                return router.responseError(new router.ErrorTemplate('Failed to update datatable: ' + err), req, res);
              response.dt = _dt;
              return router.responseSuccess(response, req, res);
            });
          }
          catch (ex) {
            console.log(ex);
          }
        }
      });
      if (!found)
        return router.responseError(new router.ErrorTemplate('data table not found.'), req, res);
    });
  }
};

exports.delete = {
  name: "/api/datatables/delete",
  description: "I delete a data source",
  inputs: {
    "required": ["name"],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    //req.params = req.params[0];
    joola.config.get('datatables', function (err, value) {
      if (err)
        return router.responseError(err, req, res);

      var datatables;
      if (!value)
        return router.responseError(new router.ErrorTemplate('No data tables are defined.'), req, res);

      datatables = value;
      var found = false;
      Object.keys(datatables).forEach(function (key) {
        if (key == req.params.name) {
          found = true;
          var dt = datatables[key];
          joola.dispatch.emitWait('datatables:delete-request', dt, function (err) {
            if (err)
              return router.responseError(new router.ErrorTemplate('Failed to delete datatable: ' + err), req, res);
            return router.responseSuccess(response, req, res);
          });
        }
      });

      if (!found)
        return router.responseError(new router.ErrorTemplate('data table not found.'), req, res);
    });
  }
};

exports.describe = {
  name: "/api/datatables/describe",
  description: "I describe a data table",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    response.datatables = datatable.proto;
    return router.responseSuccess(response, req, res);
  }
};