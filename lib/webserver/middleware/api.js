/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

var
  joola = require('../../joola.io'),
  
  url = require('url');

// the middleware function
exports.api = function (req, res, next) {
  var parts = url.parse(req.url);
  if (parts.pathname != '/api.js') {
    return next();
  }

  var describe = {
    logger: require('../../dispatch/logger'),
    users: require('../../dispatch/users'),
    workspaces: require('../../dispatch/workspaces'),
    roles: require('../../dispatch/roles'),
    permissions: require('../../dispatch/permissions'),
    system: require('../../dispatch/system'),
    beacon: require('../../dispatch/beacon'),
    query: require('../../dispatch/query'),
    collections: require('../../dispatch/collections'),
    config: require('../../dispatch/config'),
    alerts: require('../../dispatch/alerts')
  };
  delete describe.beacon.etl;
  res.json(describe);
};
