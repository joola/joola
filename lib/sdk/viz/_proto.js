/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var proto = exports;
proto._id = '_proto';

proto.markContainer = function (container, attr, callback) {
  if (!callback) callback = function () {
  };

  try {
    container.attr('jio-domain', 'joolaio');

    attr.forEach(function (a) {
      Object.keys(a).forEach(function (key) {
        container.attr('jio-' + key, a[key]);
      });
    });
  }
  catch (ex) {
    return callback(ex);
  }
  return callback(null);
};

proto.verify = function (options, callback) {
  if (!options.container)
    return callback(new Error('no container specified for timeline.'));

  var $container = $(options.container);
  if ($container === null)
    return callback(new Error('cannot find container for the timeline.'));
  
  return callback(null);
};

proto.baseHTML = function (callback) {
  return callback(null, '<br/>');
};

proto.onError = function (err, callback) {
  if (err && err.message)
    joolaio.logger.error(err.message);
  else
    joolaio.logger.error(err);
  return callback(err);
};

proto.find = function (obj) {

};