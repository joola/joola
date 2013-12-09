/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var logger = module.exports = [];
logger._id = 'logger';

logger.fetch = function (callback) {
  //validate callback
  callback = callback || function(){};
  //fetch endpoint API
  joolaio.api.fetch('/api/logger/fetch', {}, function (err, result) {
    if (err)
      return callback(err);
    return callback(null, result);
  });
};