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
  url = require('url');

// the middleware function
exports.api = function (req, res, next) {
  var parts = url.parse(req.url);
  if (parts.pathname != '/api.js') {
    return next();
  }

  var describe = {
    datasources: require('../../dispatch/datasources'),
    datatables: require('../../dispatch/datatables'),
    dimensions: require('../../dispatch/dimensions'),
    metrics: require('../../dispatch/metrics'),
    logger: require('../../dispatch/logger'),
    users: require('../../dispatch/users'),
    organizations: require('../../dispatch/organizations'),
    roles: require('../../dispatch/roles'),
    permissions: require('../../dispatch/permissions'),
    system: require('../../dispatch/system'),
    caching: require('../../dispatch/caching'),
    beacon: require('../../dispatch/beacon')
  };
  res.json(describe);
};
