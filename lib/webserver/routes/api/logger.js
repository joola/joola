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
  datasources = require('../../../objects/logger'),
  datasource = require('../../../objects/prototypes/logger');

exports.fetch = {
  name: "/api/logger/fetch",
  description: "I list all available logs",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    joola.dispatch.emitWait('logger:fetch-request', {}, function (err, logger) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to fetch log: ' + err), req, res);

      response.logger = logger;
      return router.responseSuccess(response, req, res);
    });
  }
};