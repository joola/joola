/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var datatables = module.exports = [];
datatables._id = 'datatables';

datatables.list = function (callback) {
  //validate callback
  callback = callback || function(){};
  //fetch endpoint API
  joolaio.api.fetch('/api/datatables/list', {}, function (err, result) {
    if (err)
      return callback(err);

    //clean-up the existing array
    datatables.splice(0, datatables.length);
    if (result.datatables) {
      Object.keys(result.datatables).forEach(function (key) {
        //fill the array with the datasources list
        datatables.push(result.datatables[key]);
      });
    }
    return callback(null, result);
  });
};

datatables.add = function (dt, callback) {
  //validate callback
  callback = callback || emptyfunc;

  joolaio.api.fetch('/api/datatables/add', dt, function (err, result) {
    if (err)
      return callback(err);

    return callback(null, result);
  });
};

datatables.update = function (dt, callback) {
  var self = this;
  joolaio.api.fetch('/api/datatables/update', dt, function (err, result) {
    return callback(null, result.dt);
  });
};

datatables.delete = function (dt, callback) {
  var self = this;
  joolaio.api.fetch('/api/datatables/delete', dt, function (err, result) {
    return callback(null, self);
  });
};