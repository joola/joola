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
  datasources = require('../objects/datasources');

joola.dispatch.once('datasources', 'list-request', function (channel, ds) {
  joola.logger.debug('Listing data sources');
  return datasources.list();
});

joola.dispatch.once('datasources', 'list-done', function (channel, ds) {
  joola.logger.debug('Datasource list sent');
});

joola.dispatch.once('datasources', 'add-request', function (err, ds) {
  joola.logger.debug('New datasource request [' + ds.name + ']');
  return datasources.add(ds);
});

joola.dispatch.once('datasources', 'add-done', function (err, ds) {
  if (err)
    return joola.logger.error('Failed to add datasource: ' + err);

  joola.io.sockets.emit('datasources/update:done', ds);

  joola.logger.debug('New datasource added [' + ds.name + ']');
});

joola.dispatch.on('datasources', 'delete', function (channel, ds) {
  joola.logger.debug('Deleted datasource with the name ' + ds.name);
});

joola.dispatch.on('datasources', 'update-request', function (channel, ds) {
  joola.logger.debug('Update datasource with the name ' + ds.name);
  return datasources.update(ds);
});

