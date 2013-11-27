/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var reports = module.exports = [];
reports._id = 'reports';

reports.list = function (callback) {
  joolaio.events.emit('reports.list.start');
  joolaio.api.fetch('/reports/list', function (err, result) {
    if (err)
      return callback(err);

    reports.splice(0, reports.length);
    result.reports.forEach(function (r) {
      reports.push(r);
    });

    joolaio.events.emit('reports.list.finish', reports);
    return callback(null, reports);
  });
};