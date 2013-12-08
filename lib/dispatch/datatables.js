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
  datatables = require('../objects/datatables');

joola.dispatch.on('datatables:list-request', function (channel, dt) {
  joola.logger.debug('Listing data tables');
  return datatables.list();
});

joola.dispatch.once('datatables:add-request', function (err, dt) {
  joola.logger.debug('New datatables request [' + dt.name + ']');
  return datatables.add(dt)
});

/*
 joola.dispatch.on('datasources', 'add-done', function (err, ds) {
 if (err)
 return joola.logger.error('Failed to add datasource: ' + err);

 joola.io.sockets.emit('datasources/update:done', ds);

 joola.logger.debug('New datasource added [' + ds.name + ']');
 });
 */

joola.dispatch.once('datatables:update-request', function (channel, dt) {
  joola.logger.debug('Update datasource with the name ' + dt.name);
  return datatables.update(dt);
});

joola.dispatch.once('datatables:delete-request', function (channel, dt) {
  joola.logger.debug('Deleting datatable with the name ' + dt.name);
  return datatables.delete(dt);
});


