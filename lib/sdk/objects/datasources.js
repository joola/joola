/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var datasources = module.exports = [];
datasources._id = 'datasources';

datasources.list = function (callback) {
  //validate callback
  callback = callback || function(){};

  //fetch endpoint API
  joolaio.api.fetch('/api/datasources/list', {}, function (err, result) {
    if (err)
      return callback(err);

    //clean-up the existing array
    datasources.splice(0, datasources.length);
    if (result.datasources) {
      Object.keys(result.datasources).forEach(function (key) {
        //fill the array with the datasources list
        datasources.push(result.datasources[key]);
      });
    }
    return callback(null, result);
  });
};

datasources.add = function (ds, callback) {
  //validate callback
  callback = callback || globals.emptyFunction;

  joolaio.api.fetch('/api/datasources/add', ds, function (err, result) {
    if (err)
      return callback(err);

    return callback(null, result);
  });
};

datasources.update = function (ds, callback) {
  var self = this;
  joolaio.api.fetch('/api/datasources/update', ds, function (err, result) {
    return callback(null, result.ds);
  });
};

datasources.delete = function (ds, callback) {
  var self = this;
  joolaio.api.fetch('/api/datasources/delete', ds, function (err, result) {
    return callback(null, self);
  });
};