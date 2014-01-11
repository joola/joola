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
  _ = require('underscore'),
  mongo = require('../common/mongo'),
  router = require('../webserver/routes/index');

var manager = {};

manager.parse = function (options, callback) {
  var query = joola.common.extend({}, options);

  //dimension processing
  query.dimensions.forEach(function (d, i) {
    d = joola.common.extend({}, joola.config.datamap.dimensions[d]);
    if (d) {
      joola.logger.trace('[query][' + options.uid + '] found dimension [' + d.id + '].');
      query.dimensions[i] = d;
      if (d.dependsOn) {
        joola.logger.trace('[query][' + options.uid + '] dimension depends on [' + d.dependsOn + '].');
        if (!joola.config.datamap.dimensions.hasOwnProperty(d.dependsOn))
          return callback(new Error('dimension [' + d.id + '] depends on [' + d.dependsOn + '] which could not be resolved.'));

        var depend = joola.common.extend(joola.config.datamap.dimensions[d.dependsOn]);
        d.dependsOn = depend;
      }
    }
  });

  //metrics processing
  var metricsValid = true;
  query.metrics.forEach(function (m, i) {
    if (typeof m === 'object') {
      var col = _.find(joola.config.datamap.collections, function (collection) {
        return collection.metrics[m.dependsOn] != null;
      });
      if (!col)
        metricsValid = false;

      else {
        query.metrics[i] = joola.common.extend(col.metrics[m.dependsOn], m);
        query.metrics[i].type = 'ad-hoc';
        query.metrics[i].collection = col;
      }
    }
    else {
      var col = _.find(joola.config.datamap.collections, function (collection) {
        return collection.metrics[m] != null;
      });
      if (!col)
        metricsValid = false;
      else {
        query.metrics[i] = col.metrics[m];
        query.metrics[i].type = 'plain';
        query.metrics[i].collection = col;
      }
    }
  });

  if (!metricsValid)
    return callback(new Error('Failed to locate metrics.'));

  return callback(null, query);
};

manager.applyFilters = function (query, callback) {
  return callback(null, query);
};

manager.translateTimeframe = function (timeframe) {
  var _date = new Date();
  switch (timeframe) {
    case 'last_30_minutes':
      _date.setMinutes(_date.getMinutes() - 30);
      return {
        start: new Date(_date),
        end: new Date()
      };
    default:
      return null;
  }
};

manager.buildQueryPlan = function (query, callback) {
  var plan = {
    uid: joola.common.uuid(),
    cost: 0,
    colQueries: {}
  };
  var $match = {};
  var $project = {};
  var $group = {};

  //let's build the interval, timeframe for the $match
  var timeframe = {
    start: null,
    end: null
  };

  if (query.timeframe) {
    if (typeof query.timeframe === 'string')
      query.timeframe = manager.translateTimeframe(query.timeframe);

    if (!query.timeframe.start || !query.timeframe.end)
      return callback(new Error('Failed to translate timeframe provided into proper timeframe object'));

    $match.timestamp = {$gte: query.timeframe.start, $lte: query.timeframe.end}
  }

  //let's see if we need to add any date dimensions
  var dates = _.filter(query.dimensions, function (d) {
    return d.type == 'date';
  });
  if (dates.length > 0) {
    dates.forEach(function (date) {
      $project[date.id] = '$timestamp';
      $group['_id'] = '$' + date.id;
      //$group['_id']['$' + date.id] = 1;
    });
  }

  query.metrics.forEach(function (metric) {
    var colQuery = {
      collection: metric.collection.id,
      query: []
    };

    var _$match = joola.common.extend({}, $match);
    var _$project = joola.common.extend({}, $project);
    var _$group = joola.common.extend({}, $group);

    colQuery.key = joola.common.hash(metric.collection.id + '_' + JSON.stringify(_$match));
    if (plan.colQueries[colQuery.key]) {
      _$group = joola.common.extend({}, plan.colQueries[colQuery.key].query[2].$group);
    }

    _$group[metric.id] = {};
    _$group[metric.id]['$' + metric.aggregation] = '$' + metric.id;
    colQuery.query = [
      {$match: _$match},
      {$project: _$project},
      {$group: _$group},
      {$sort: {_id: -1}}
    ];

    plan.colQueries[colQuery.key] = colQuery;
  });

  return callback(null, plan);
};

manager.executePlan = function (queryplan, callback) {

  Object.keys(queryplan.colQueries).forEach(function (query) {
    query = queryplan.colQueries[query];

    console.log(query.query);
    console.log(query.query[2]);

    mongo.aggregate('cache', query.collection, query.query, {}, function (err, results) {
      if (err)
        return callback(err);

      return callback(null, results);
    })
  });
};

manager.formatResults = function (results, callback) {
  return callback(null, results);
};

manager.loadFromCache = function (query, callback) {
  return callback(null);
};

manager.saveToCache = function (query, results, callback) {
  return callback(null);
};

exports.fetch = {
  name: "/api/query/fetch",
  description: "",
  inputs: ['options'],
  _outputExample: {},
  _permission: ['access_system'],
  _dispatch: {
    message: 'query:fetch'
  },
  run: function (options, callback) {
    callback = callback || emptyfunc;

    options = joola.common.extend({
      uid: joola.common.uuid(),
      dimensions: [],
      metrics: [],
      interval: 'daily',
      timeframe: 'last_30_days',
      realtime: false,
      filter: null
    }, options);

    manager.parse(options, function (err, query) {
      if (err)
        return callback(err);

      console.log(query);
      manager.loadFromCache(query, function (err, cached) {
        if (err)
          return callback(err);

        if (cached)
          return callback(null, cached);

        manager.applyFilters(query, function (err, query) {
          if (err)
            return callback(err);

          manager.buildQueryPlan(query, function (err, queryplan) {
            if (err)
              return callback(err);

            console.log(queryplan);

            manager.executePlan(queryplan, function (err, results) {
              if (err)
                return callback(err);
              manager.formatResults(results, function (err, results) {
                if (err)
                  return callback(err);

                manager.saveToCache(query, results, function (err) {
                  if (err)
                    return callback(err);

                  return callback(null, results);
                });
              });
            });
          });
        });
      });
    });
  }
};