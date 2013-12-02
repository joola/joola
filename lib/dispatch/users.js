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
  users = require('../objects/users');

joola.dispatch.once('users', 'list-request', function (channel, ds) {
  joola.logger.debug('Listing users');
  return users.list();
});

joola.dispatch.once('users', 'list-done', function (channel, ds) {
  joola.logger.debug('users list sent');
});

joola.dispatch.once('users', 'add-request', function (err, user) {
  joola.logger.debug('New users request [' + user.name + ']');
  return users.add(user);
});

joola.dispatch.once('users', 'add-done', function (err, user) {
  if (err)
    return joola.logger.error('Failed to add users: ' + err);

  joola.io.sockets.emit('users/update:done', user);

  joola.logger.debug('New users added [' + user.name + ']');
});

joola.dispatch.on('users', 'delete', function (channel, user) {
  joola.logger.debug('Deleted users with the name ' + user.name);
});

joola.dispatch.on('users', 'update-request', function (channel, user) {
  joola.logger.debug('Update users with the name ' + user.name);
  return users.update(ds);
});

