/**
 *  joola
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

var
  joola = require('../../joola'),

  url = require('url');

// the middleware function
module.exports = function serviceMeta() {
  return function serviceMeta(req, res, next) {
    var parts = url.parse(req.url);
    if (parts.pathname != '/meta') {
      return next();
    }

    var describe = {
      users: require('../../dispatch/users'),
      workspaces: require('../../dispatch/workspaces'),
      roles: require('../../dispatch/roles'),
      permissions: require('../../dispatch/permissions'),
      system: require('../../dispatch/system'),
      beacon: require('../../dispatch/beacon'),
      query: require('../../dispatch/query'),
      collections: require('../../dispatch/collections'),
      dimensions: require('../../dispatch/dimensions'),
      metrics: require('../../dispatch/metrics'),
      config: require('../../dispatch/config'),
      canvases: require('../../dispatch/canvases'),
      test: require('../../dispatch/test')
    };
    delete describe.beacon.etl;
    res.json(describe);
  };
};
