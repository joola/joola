/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var
  url = require('url');

var users = exports;

users.list = function (callback) {
  joola.config.get('users', function (err, value) {
    if (err)
      return joola.dispatch.emit('users', 'list-done', {err: err});

    return joola.dispatch.emit('users', 'list-done', {err: null, message: value});
  });
};

users.get = function (id, callback) {
  this.list(function (err, users) {
    if (err)
      return callback(err);

    var user = _.find(users, function (user) {
      return user.id.toLowerCase() == userid.toLowerCase();
    });

    if (!user)
      return callback(new Error('Failed to find user [' + id + ']'));

    return user;
  });
};

users.add = function (user, callback) {
  joola.config.get('users', function (err, value) {
    if (err)
      return joola.dispatch.emit('users', 'add-done', {err: err});

    var users;
    if (!value)
      users = {};
    else
      users = value;
    users[user._username] = user;

    joola.config.set('users', users, function (err) {
      if (err)
        return joola.dispatch.emit('users', 'add-done', {err: err});

      return joola.dispatch.emit('users', 'add-done', {err: null, message: user});
    });
  });
};

users.update = function (user, callback) {
  joola.config.get('users', function (err, value) {
    if (err)
      return joola.dispatch.emit('users', 'update-done', {err: err});

    var users;
    if (!value)
      users = {};
    else
      users = value;
    users[user.name] = user;

    joola.config.set('users', users, function (err) {
      if (err)
        return joola.dispatch.emit('users', 'update-done', {err: err});

      return joola.dispatch.emit('users', 'update-done', {err: null, message: user});
    });
  });
};

users.delete = function (user, callback) {
  joola.config.get('users', function (err, value) {
    if (err)
      return joola.dispatch.emit('users', 'delete-done', {err: err});

    var users;
    if (!value)
      users = {};
    else
      users = value;
    users[user._username] = user;

    joola.config.set('users', users, function (err) {
      if (err)
        return joola.dispatch.emit('users', 'delete-done', {err: err});

      return joola.dispatch.emit('users', 'delete-done', {err: null, message: user});
    });
  });
};