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
  async = require('async'),
  mongo = require('../common/mongo'),
  moment = require('moment'),
  ce = require('cloneextend'),

  router = require('../webserver/routes/index');

require('twix');

var manager = {};

manager.parse = function (options, callback) {
  var query = joola.common.extend({}, options);

  //dimension processing
  query.dimensions.forEach(function (d, i) {
    if (joola.config.datamap.dimensions[d]) {
      d = joola.common.extend({}, joola.config.datamap.dimensions[d]);
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
    else {
      var exist = _.find(joola.config.datamap.collections, function (collection) {
        return _.find(collection.dimensions, function (dimension) {
          return dimension.id == d;
        });
      });
      if (exist) {
        d = joola.common.extend({}, exist.dimensions[d]);
        joola.logger.trace('[query][' + options.uid + '] found dimension [' + d.id + '].');
        query.dimensions[i] = d;
      }
      else
        return callback(new Error('Failed to translate dimension [' + d + ']'));
    }
  });

  //metrics processing
  var col;
  var metricsValid = true;
  query.metrics.forEach(function (m, i) {
    if (typeof m === 'object') {
      col = _.find(joola.config.datamap.collections, function (collection) {
        return  collection.metrics && collection.metrics[m.dependsOn] && collection.metrics[m.dependsOn].id === m.dependsOn;
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
      col = _.find(joola.config.datamap.collections, function (collection) {
        return collection.metrics && collection.metrics[m] && collection.metrics[m].id === m;
      });
      if (col) {
        query.metrics[i] = joola.common.extend({}, col.metrics[m]);
        query.metrics[i].type = 'plain';
        query.metrics[i].collection = col;
      }
      else {
        //let's see if it's global
        m = joola.common.extend({}, joola.config.datamap.metrics[m]);
        if (!m)
          metricsValid = false;
        else {
          query.metrics[i] = m;
          query.metrics[i].type = 'global';
          //if we're dealing with formula we need to add dependent objects.
          if (m.formula && m.formula.dependsOn) {
            m.formula.dependsOn.forEach(function (m) {
              var exist = _.find(query.metrics, function (lookup) {
                return lookup.id == m;
              });
              if (!exist) {

                col = _.find(joola.config.datamap.collections, function (collection) {
                  return collection.metrics && collection.metrics[m] && collection.metrics[m].id === m;
                });
                if (col) {
                  var _m = joola.common.extend({}, col.metrics[m]);
                  _m.type = 'dependent';
                  _m.collection = col;
                  query.metrics.push(_m);
                }
              }
            });
          }
        }
      }
    }
  });

  if (!metricsValid) {
    return callback(new Error('Failed to locate metrics.'));
  }

  return callback(null, query);
};

manager.applyFilters = function (query, callback) {
  return callback(null, query);
};

manager.translateTimeframe = function (timeframe) {
  var _date = new Date();
  switch (timeframe) {
    case 'last_5_seconds':
      _date.setSeconds(_date.getSeconds() - 5);
      return {
        start: new Date(_date),
        end: new Date()
      };
    case 'last_30_seconds':
      _date.setSeconds(_date.getSeconds() - 30);
      return {
        start: new Date(_date),
        end: new Date()
      };
    case 'last_minute':
      _date.setMinutes(_date.getMinutes() - 1);
      return {
        start: new Date(_date),
        end: new Date()
      };
    case 'last_5_minutes':
      _date.setMinutes(_date.getMinutes() - 5);
      return {
        start: new Date(_date),
        end: new Date()
      };
    case 'last_10_minutes':
      _date.setMinutes(_date.getMinutes() - 10);
      return {
        start: new Date(_date),
        end: new Date()
      };
    case 'last_30_minutes':
      _date.setMinutes(_date.getMinutes() - 30);
      return {
        start: new Date(_date),
        end: new Date()
      };
    case 'last_hour':
      _date.setHours(_date.getHours() - 1);
      return {
        start: new Date(_date),
        end: new Date()
      };
    case 'last_day':
      _date.setDate(_date.getDate() - 1);
      return {
        start: new Date(_date),
        end: new Date()
      };
    default:
      return null;
  }
};

manager.translateInterval = function (interval) {
  switch (interval) {
    case 'second':
      return 'timebucket.second';
    case 'minute':
      return 'timebucket.minute';
    case 'hour':
      return 'timebucket.hour';
    case 'date':
      return 'timebucket.date';
    default:
      return 'timebucket.date';
  }
};

manager.buildQueryPlan = function (query, callback) {
  var plan = {
    uid: joola.common.uuid(),
    cost: 0,
    colQueries: {},
    query: query
  };
  var $match = {};
  var $project = {};
  var $group = {};

  if (query.timeframe) {
    if (typeof query.timeframe === 'string')
      query.timeframe = manager.translateTimeframe(query.timeframe);

    if (!query.timeframe.start || !query.timeframe.end)
      return callback(new Error('Failed to translate timeframe provided into proper timeframe object'));

    $match.timestamp = {$gte: query.timeframe.start, $lte: query.timeframe.end};
  }

  query.interval = manager.translateInterval(query.interval);

  $group._id = {};
  query.dimensions.forEach(function (dimension) {

    switch (dimension.type) {
      case 'date':
        $group._id[dimension.id] = '$' + dimension.id + '_' + query.interval;
        break;
      case 'ip':
      case 'string':
        $group._id[dimension.id] = '$' + dimension.id;
        break;
      case 'geo':
        break;
      default:
        return callback(new Error('Dimension [' + dimension.id + '] has unknown type of [' + dimension.type + ']'));
    }
  });

  query.metrics.forEach(function (metric) {
    if (!metric.formula) {
      var colQuery = {
        collection: metric.collection ? metric.collection.id : null,
        query: []
      };

      if (metric.aggregation == 'ucount')
        colQuery.type = 'ucount';
      else
        colQuery.type = 'plain';

      var _$match = joola.common.extend({}, $match);
      var _$project = joola.common.extend({}, $project);
      var _$group = joola.common.extend({}, $group);

      colQuery.key = joola.common.hash(colQuery.type + '_' + metric.collection.id + '_' + JSON.stringify(_$match));
      if (colQuery.type == 'plain') {
        if (plan.colQueries[colQuery.key]) {
          _$group = joola.common.extend({}, plan.colQueries[colQuery.key].query[1].$group);
        }

        _$group[metric.id] = {};
        if (metric.aggregation == 'count')
          _$group[metric.id].$sum = 1;
        else
          _$group[metric.id]['$' + metric.aggregation] = '$' + metric.id;
        colQuery.query = [
          {$match: _$match},
          // {$project: _$project},
          {$group: _$group},
          {$sort: {_id: -1}}
        ];
        //console.log('$match', _$match)
        //console.log('g', _$group);
      }
      else {
        var _$unwind, _$group2;

        _$group[metric.dependsOn] = {'$addToSet': '$' + metric.dependsOn};
        _$unwind = '$' + metric.dependsOn;
        _$group2 = {'_id': '$_id'};
        _$group2[metric.id] = {'$sum': 1};
        colQuery.query = [
          {$match: _$match},
          // {$project: _$project},
          {$group: _$group},
          {$unwind: _$unwind},
          {$group: _$group2},
          {$sort: {_id: -1}}
        ];

        //console.log('g', _$group);
        //console.log('u', _$unwind);
        //console.log('g2', _$group2)
      }

      plan.colQueries[colQuery.key] = colQuery;
    }
  });

  plan.dimensions = query.dimensions;
  plan.metrics = query.metrics;
  return callback(null, plan);
};

manager.executePlan = function (queryplan, callback) {
  var result = {
    dimensions: [],
    metrics: [],
    documents: [],
    queryplan: queryplan
  };

  async.map(_.toArray(queryplan.colQueries), function iterator(_query, next) {
    mongo.aggregate('cache', _query.collection, _query.query, {}, function (err, results) {
      if (err)
        return next(err);

      result.dimensions = queryplan.dimensions;
      result.metrics = queryplan.metrics;

      //prevent circular references on output.
      result.metrics.forEach(function (m, i) {
        if (!m.formula) {
          if (m.collection)
            m.collection = m.collection.id;
          result.metrics[i] = m;
        }
      });
      result.documents = results;
      return next(null, joola.common.extend({}, result));
    });
  }, function (err, results) {
    if (err)
      return callback(err);

    var output = {
      queryplan: queryplan
    };
    var keys = [];
    var final = [];

    if (results && results.length > 0) {
      output.dimensions = results[0].dimensions;
      output.metrics = results[0].metrics;

      results.forEach(function (_result) {
        _result.documents.forEach(function (document) {
          var key = joola.common.hash(JSON.stringify(document._id));
          var row;

          if (keys.indexOf(key) == -1) {
            row = {};
            Object.keys(document._id).forEach(function (key) {
              row[key] = document._id[key];
            });
            row.key = key;
            keys.push(key);
            final.push(row);
          }
          else {
            row = _.find(final, function (f) {
              return f.key == key;
            });
          }

          Object.keys(document).forEach(function (attribute) {
            if (attribute != '_id') {
              row[attribute] = document[attribute];
            }
          });
          output.metrics.forEach(function (m) {
            if (!row[m.id])
              row[m.id] = null;
          });
          output.dimensions.forEach(function (d) {
            if (typeof row[d.id] === 'undefined') {
              row[d.id] = '(not set)';
            }
          });

          final[keys.indexOf(key)] = row;
        });
      });
      output.documents = final;
      return callback(null, output);
    }
    else
      return callback(null);
  });
};

manager.formatResults = function (results, callback) {
  var query = results.queryplan.query;

  results.documents.forEach(function (document, dindex) {
    document.values = {};
    document.fvalues = {};

    delete document.key;
    results.dimensions.forEach(function (dimension) {
      document.values[dimension.id] = document[dimension.id];
      if (dimension.type == 'date') {
        document.fvalues[dimension.id] = document.values[dimension.id];
      }
      else if (dimension.type === 'ip' && document[dimension.id] && document[dimension.id] !== '(not set)') {
        var ip = document[dimension.id];
        document.fvalues[dimension.id] = joola.common.extend({ip: ip}, joola.common.geoip.lookup(ip));
      }
      else if (dimension.type === 'geo') {

      }
      else {
        document.fvalues[dimension.id] = document.values[dimension.id];
      }

      if (dimension.transform) {
        var transformFn = eval('(' + dimension.transform + ')');
        document.fvalues[dimension.id] = transformFn.apply(dimension, [document.values[dimension.id]]);
      }

      //document.fvalues[dimension.id] = document.values[dimension.id];
    });
    results.metrics.forEach(function (metric) {
      document.values[metric.id] = document[metric.id];
      document.fvalues[metric.id] = document.values[metric.id];
      if (metric.formula) {
        var calc = eval('(' + metric.formula.run + ')');
        var args = [];
        metric.formula.dependsOn.forEach(function (dep) {
          args.push(document[dep]);
        });

        document.values[metric.id] = calc.apply(document, args);
        document.fvalues[metric.id] = document.values[metric.id];
      }

      if (metric.decimals) {
        document[metric.id] = Math.round(document[metric.id] * (Math.pow(10, metric.decimals))) / (Math.pow(10, metric.decimals));
      }
      else {
        try {
          document[metric.id] = Math.round(document[metric.id] * 100) / 100;
        }
        catch (ex) {

        }
      }

      if (document.values[metric.id]) {
        if (metric.prefix)
          document.fvalues[metric.id] = metric.prefix + document[metric.id].toString();
        if (metric.suffix)
          document.fvalues[metric.id] = document[metric.id].toString() + metric.suffix;
      }
      else
        document.fvalues[metric.id] = null;

      if (metric.type === 'dependent') {
        delete document.values[metric.id];
        delete document.fvalues[metric.id];
      }

    });
    Object.keys(document).forEach(function (key) {
      if (['values', 'fvalues'].indexOf(key) == -1)
        delete document[key];
    });
    results.documents[dindex] = document;

  });

  var timestampDimension = _.find(results.dimensions, function (d) {
    return d.type === 'date';
  });
  if (timestampDimension) {
    var interval = query.interval.replace('timebucket.', '');
    var itr = moment.twix(query.timeframe.start, query.timeframe.end).iterate(interval);
    var _documents = [];
    var templateItem = {values: {}, fvalues: {}};

    if (results.documents.length > 0) {
      Object.keys(results.documents[0].values).forEach(function (key) {
        templateItem.values[key] = null;
      });
      Object.keys(results.documents[0].fvalues).forEach(function (key) {
        templateItem.fvalues[key] = null;
      });
    }
    else {
      results.dimensions.forEach(function (d) {
        templateItem.values[d.id] = null;
        templateItem.fvalues[d.id] = null;
      });
      results.metrics.forEach(function (m) {
        templateItem.values[m.id] = null;
        templateItem.fvalues[m.id] = null;
      });
    }

    while (itr.hasNext()) {
      var _d = new Date(itr.next()._d.getTime());

      var exists = _.find(results.documents, function (document) {
        return document.values[timestampDimension.id].getTime() === _d.getTime();
      });

      if (exists)
        _documents.push(exists);
      else {
        var _templateItem = joola.common.extend({}, templateItem);
        _templateItem.values[timestampDimension.id] = new Date(_d);
        _templateItem.fvalues[timestampDimension.id] = new Date(_d.getTime());
        _documents.push(ce.clone(_templateItem));
      }
    }
    results.documents = _documents;
  }

  //sort
  results.documents = _.sortBy(results.documents, function (document) {
    return document.values[Object.keys(document.values)[0]];
  });


  query.ts.end = new Date();
  query.ts.duration = query.ts.end.getTime() - query.ts.start.getTime();
  results.stats = {
    times: query.ts
  };
  return callback(null, results);
};

manager.loadFromCache = function (query, callback) {
  return callback(null);
};

manager.saveToCache = function (results, callback) {
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
  _route: function (req, res) {
    var _params = {};
    Object.keys(req.params).forEach(function (p) {
      if (p != 'resource' && p != 'action')
        _params[p] = req.params[p];
    });
    var aborted, timerID;

    var request = function (callback) {
      joola.dispatch.request(req.token._, 'query:fetch', _params, function (err, result) {
        clearTimeout(timerID);

        if (aborted)
          return;
        if (err)
          if (callback)
            return callback(new router.ErrorTemplate('Failed to route action [' + 'fetch' + ']: ' + (typeof(err) === 'object' ? err.message : err)));
          else
            return router.responseError(new router.ErrorTemplate('Failed to route action [' + 'fetch' + ']: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

        if (callback)
          return callback(null, result);
        else
          return router.responseSuccess(result, req, res);
      });

      timerID = setTimeout(function () {
        if (callback)
          return callback(new router.ErrorTemplate('Timeout while waiting for [' + 'fetch' + ']'));
        else
          return router.responseError(new router.ErrorTemplate('Timeout while waiting for [' + 'fetch' + ']'), req, res);
      }, 15000);
    };

    if (_params.options.realtime) {
      var realtime = function () {
        request(function (err, result) {
          if (err)
            return;

          if (res.socket.disconnected)
            clearInterval(intervalID);
          else
            return router.responseSuccess(result, req, res);
          //setTimeout(realtime, 1000);
        });
      };
      var interval = 1000;
      /*
       switch (_params.options.interval) {
       case 'second':
       interval = 1000;
       break;
       case 'minute':
       interval = 1000 * 60;
       break;
       }*/

      var intervalID = setInterval(realtime, interval);
    }
    request();
  },
  run: function (context, options, callback) {
    callback = callback || emptyfunc;

    options = joola.common.extend({
      ts: {
        start: new Date()
      },
      uid: joola.common.uuid(),
      dimensions: [],
      metrics: [],
      interval: 'daily',
      // timeframe: 'last_30_days',
      realtime: false,
      filter: null
    }, options);

    manager.parse(options, function (err, query) {
      if (err)
        return callback(err);

      manager.applyFilters(query, function (err, query) {
        if (err)
          return callback(err);

        manager.loadFromCache(query, function (err, cached) {
          if (err)
            return callback(err);

          if (cached)
            return callback(null, cached);

          manager.buildQueryPlan(query, function (err, queryplan) {
            if (err)
              return callback(err);

            manager.executePlan(queryplan, function (err, results) {
              if (err)
                return callback(err);
              manager.formatResults(results, function (err, results) {
                if (err)
                  return callback(err);

                manager.saveToCache(results, function (err) {
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