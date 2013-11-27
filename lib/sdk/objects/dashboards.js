/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var dashboards = module.exports = [];
dashboards._id = 'dashboards';

dashboards.list = function (callback) {
  joolaio.events.emit('dashboards.list.start');
  joolaio.api.fetch('/dashboards/list', function (err, result) {
    if (err)
      return callback(err);

    dashboards.splice(0, dashboards.length);
    result.dashboards.forEach(function (d) {
      dashboards.push(d);
    });

    joolaio.events.emit('dashboards.list.finish', dashboards);
    return callback(null, dashboards);
  });
};