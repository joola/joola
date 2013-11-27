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
  var self = this;
  joolaio.events.emit('datasources.list.start');

  joolaio.api.fetch('/datasources/list', {}, function (err, result) {
    if (err)
      return callback(err);

    datasources.splice(0, datasources.length);
    Object.keys(result.datasources).forEach(function (key) {
      datasources.push(result.datasources[key]);
    });

    joolaio.events.emit('datasources.list.finish', self);
    return callback(null, self);
  });
};

datasources.add = function (ds, callback) {
  var self = this;
  joolaio.events.emit('datasources.add.start');
  joolaio.api.fetch('/datasources/add', ds, function (err, result) {
    joolaio.events.emit('datasources.add.finish', ds);
    return callback(null, ds);
  });
};

datasources.update = function (ds, callback) {
  var self = this;
  joolaio.events.emit('datasources.update.start');
  joolaio.api.fetch('/datasources/update', ds, function (err, result) {
    joolaio.events.emit('datasources.update.finish', self);
    return callback(null, self);
  });
};

datasources.delete = function (ds, callback) {
  var self = this;
  joolaio.events.emit('datasources.delete.start');
  joolaio.api.fetch('/datasources/delete', ds, function (err, result) {
    joolaio.events.emit('datasources.delete.finish', self);
    return callback(null, self);
  });
};