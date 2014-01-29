/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var ce = require('cloneextend');

var proto = exports;
proto._id = '_proto';

proto.markContainer = function (container, attr, callback) {
  if (!callback)
    callback = function () {
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

proto.fetch = function (query, callback) {
  joolaio.dispatch.query.fetch(ce.clone(query), function (err, message) {
    if (err)
      return callback(err);

    if (message && message.stats && message.stats.times)
      joolaio.logger.debug('fetch took: ' + message.stats.times.duration.toString() + 'ms, results: ' + (message && message.documents ? message.documents.length.toString() : 'n/a'));

    return callback(null, message);
  });
};

proto.makeChartSeries = function (dimensions, metrics, documents) {
  var series = [];
  if (!metrics)
    return series;
  
  metrics.forEach(function (metric, index) {
    series[index] = {
      name: metric.name,
      data: []
    };

    documents.forEach(function (document) {
      series[index].data.push({
        x: new Date(document.fvalues[dimensions[0].id]),
        y: document.values[metrics[index].id] ? document.values[metrics[index].id] : 0
      });
    });
  });

  return series;
};

proto.makeGeoSeries = function (dimensions, metrics, documents) {
  var results = [];
  results.push(['Country', metrics[0].name])

  if (dimensions[0].type == 'ip') {
    documents.forEach(function (document) {
      if (document.fvalues[dimensions[0].id] != '(not set)' && document.fvalues[dimensions[0].id].country)
        results.push([document.fvalues[dimensions[0].id].country, document.fvalues[metrics[0].id]]);
    });
  }
  else
    return results;

  return google.visualization.arrayToDataTable(results);
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