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

var stub = function (description) {
  this.endpoint = description.name;

  this.fetch = function () {
    console.log('fetch for ' + this.endpoint);
  };
};

// the middleware function
exports.api = function (req, res, next) {
  var parts = url.parse(req.url);
  if (parts.pathname != '/api.js') {
    return next();
  }

  var describe = {datasources: require('../../dispatch/datasources')};
  res.json(describe);


  //return next();
};
