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
  mongo = require('../common/mongo'),
  router = require('../webserver/routes/index');

exports.fetch = {
  name: "/api/logger/fetch",
  description: "I fetch all logs",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
    var self = this;
    joola.dispatch.on('logger:fetch-request', function () {
      joola.logger.debug('Fetching logs');
      self.run(function (err, value) {
        joola.dispatch.emit('logger:fetch-done', {err: err, message: value});
      });
    });
  },
  route: function (req, res) {
    var response = {};
    joola.dispatch.emitWait('logger:fetch-request', {}, function (err, log) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to fetch logs: ' + err), req, res);
      response = log;
      return router.responseSuccess(response, req, res);
    });
  },
  run: function (callback) {
    callback = callback || emptyfunc;

    mongo.find('logger', 'events', {}, {}, function (err, logs) {
      return callback(err, logs);
    });
  }
};
