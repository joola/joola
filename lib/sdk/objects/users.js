/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var users = module.exports = [];
users.id = 'users';

users.list = function (callback) {
  var self = this;
  joolaio.events.emit('users.list.start');

  joolaio.api.fetch('/users/list', {}, function (err, result) {
    if (err)
      return callback(err);

    users.splice(0, users.length);
    Object.keys(result.users).forEach(function (key) {
      users.push(result.users[key]);
    });

    joolaio.events.emit('users.list.finish', self);
    return callback(null, self);
  });
};

users.add = function (ds, callback) {
  var self = this;
  joolaio.events.emit('users.add.start');
  joolaio.api.fetch('/users/add', ds, function (err, result) {
    joolaio.events.emit('users.add.finish', ds);
    return callback(null, ds);
  });
};

users.update = function (ds, callback) {
  var self = this;
  joolaio.events.emit('users.update.start');
  joolaio.api.fetch('/users/update', ds, function (err, result) {
    joolaio.events.emit('users.update.finish', self);
    return callback(null, self);
  });
};

users.delete = function (ds, callback) {
  var self = this;
  joolaio.events.emit('users.delete.start');
  joolaio.api.fetch('/users/delete', ds, function (err, result) {
    joolaio.events.emit('users.delete.finish', self);
    return callback(null, self);
  });
};