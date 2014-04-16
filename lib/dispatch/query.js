/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  joola = require('../joola.io'),

  _ = require('underscore'),
  async = require('async'),
  mongo = require('../common/mongo'),
  moment = require('moment'),
  ce = require('cloneextend'),

  localeval = require('localeval'),

  router = require('../webserver/routes/index');

require('twix');

var manager = {};


//TODO: Replace this
function fixOffset(date) {
  var _date = new Date(date);
  _date.setHours(_date.getHours() + (-1 * moment().zone() / 60));
  return new Date(_date);
}

manager.parseDimensions = function (context, dimensions, callback) {
  var _dimensions = [];

  var expected = 0;
  if (dimensions.length === 0)
    return setImmediate(function () {
      return callback(null, _dimensions);
    });
  dimensions.forEach(function (d) {
    expected++;
    manager.parseDimension(context, d, function (err, dimension) {
      expected--;
      if (err)
        return setImmediate(function () {
          return callback(err);
        });
      _dimensions.push(dimension);

      if (expected === 0) {
        return setImmediate(function () {
          return callback(null, _dimensions);
        });
      }
    });
  });
};

manager.parseMetrics = function (context, metrics, callback) {
  var _metrics = [];

  var expected = 0;
  if (metrics.length === 0)
    return setImmediate(function () {
      return callback(null, _metrics);
    });
  metrics.forEach(function (m) {
    expected++;
    manager.parseMetric(context, m, function (err, metric) {
      expected--;
      if (err)
        return setImmediate(function () {
          return callback(err);
        });
      _metrics.push(metric);
      if (expected === 0) {
        return setImmediate(function () {
          return callback(null, _metrics);
        });
      }
    });
  });
};

manager.parseDimension = function (context, d, callback) {
  var col;
  var dimension = {};

  if (!d)
    return setImmediate(function () {
      return callback(new Error('Failed to parse dimension [' + d + ']'));
    });

  var prepareDimension = function (collection, dimension, parentDimension, callback) {
    if (dimension)
      dimension.adhoc = true;
    else
      dimension = {};

    if (!dimension.datatype) {
      if (dimension.key === 'timestamp')
        dimension.datatype = 'date';
      else
        dimension.datatype = 'string';
    }

    var keep = {
      name: dimension.name
    };
    dimension = ce.extend(dimension, parentDimension);
    if (keep.name)
      dimension.name = keep.name;
    dimension.attribute = dimension.attribute || dimension.dependsOn || dimension.key;
    dimension.collection = collection;

    if (dimension.key.indexOf('.') > -1)
      dimension.key = dimension.key.replace(/\./ig, '_');

    return process.nextTick(function () {
      callback(null, dimension);
    });
  };

  if (typeof d !== 'object') {
    d = {key: d};
  }
  //if this is a computed dimension, simply pass it on
  if (!d.dependsOn)
    d.dependsOn = d.key;
  if (!d.name)
    d.name = d.key;

  d.collection = d.collection || context.query.collection;
  //let's find the metric
  if (d.collection) {
    //we're looking for a specific collection containing this metric
    joola.dispatch.collections.get(context, context.user.workspace, d.collection, function (err, collection) {
      if (err)
        return setImmediate(function () {
          return callback(err);
        });

      col = collection[d.dependsOn] ? collection : null;

      if (!col && d.dependsOn.indexOf('.') > -1) {
        //let's see if we're dealing with a compound key
        if (joola.common.checkNested(collection, d.dependsOn))
          col = collection;
      }

      if (!col)
        return setImmediate(function () {
          return callback(new Error('Failed to locate collection for dimension [' + dimension.key + ']'));
        });
      prepareDimension(col, d, col[d], callback);
    });
  }
  else {
    return setImmediate(function () {
      return callback(new Error('Failed to locate collection for dimension [' + dimension.key + ']'));
    });
  }
};

manager.parseMetric = function (context, m, callback) {
  var col;
  var metric = {};

  if (!m)
    return setImmediate(function () {
      return callback(new Error('Failed to parse metric [' + m + ']'));
    });

  var prepareMetric = function (collection, metric, parentMetric, callback) {
    try {
      if (metric)
        metric.adhoc = true;
      else
        metric = {};

      var keep = {
        name: metric.name
      };
      metric = ce.extend(metric, parentMetric);
      if (keep.name)
        metric.name = keep.name;
      metric.attribute = metric.attribute || metric.dependsOn || metric.key;
      metric.collection = collection;

      if (!metric.key)
        metric.key = 'key';

      metric._key = metric.key;
      if (metric.key.indexOf('.') > -1) {
        metric.key = metric.key.replace(/\./ig, '_');
      }

      return process.nextTick(function () {
        callback(null, metric);
      });
    }
    catch (ex) {
      return setImmediate(function () {
        return callback(ex);
      });
    }
  };
  if (typeof m !== 'object') {
    m = {key: m};
  }
  //if this is a computed metric, simply pass it on
  if (m.formula)
    return setImmediate(function () {
      return callback(null, m);
    });
  m.collection = m.collection || context.query.collection;
  if (!m.key && m.dependsOn)
    m.key = m.dependsOn;
  if (!m.dependsOn)
    m.dependsOn = m.key;
  if (!m.name)
    m.name = m.key;

  //let's find the metric
  if (m.collection) {
    //we're looking for a specific collection containing this metric
    joola.dispatch.collections.get(context, context.user.workspace, m.collection, function (err, collection) {
      if (err)
        return setImmediate(function () {
          return callback(err);
        });

      col = collection[m.dependsOn] ? collection : null;

      if (!col && m.dependsOn.indexOf('.') > -1) {
        //let's see if we're dealing with a compound key
        if (joola.common.checkNested(collection, m.dependsOn)) {
          col = collection;
        }
      }

      if (!col)
        return setImmediate(function () {
          return callback(new Error('Failed to locate collection for metric [' + metric.key + ']'));
        });
      prepareMetric(col, m, col[m], callback);
    });
  }
  else {
    return setImmediate(function () {
      return callback(new Error('Failed to locate collection for metric [' + metric.key + ']'));
    });
  }

  return metric;
};

manager.parse = function (context, options, callback) {
  var query = joola.common.extend({}, options);

  if (!query.dimensions)
    query.dimensions = [];
  if (!query.metrics)
    query.metrics = [];

  if (query.timeframe) {
    if (typeof query.timeframe === 'string')
      query.timeframe = manager.translateTimeframe(query.timeframe, query.interval);

    if (query.timeframe_force_end)
      query.timeframe.end = new Date(query.timeframe_force_end);

    if (query.timeframe_force_start) {
      query.timeframe.start = new Date(query.timeframe_force_start);
    }

    if (!query.timeframe.start || !query.timeframe.end)
      return setImmediate(function () {
        return callback(new Error('Failed to translate timeframe provided into proper timeframe object'));
      });

    if (typeof query.timeframe.start === 'string')
      query.timeframe.start = new Date(query.timeframe.start);
    if (typeof query.timeframe.end === 'string')
      query.timeframe.end = new Date(query.timeframe.end);
  }
  /*
  else
    query.timframe = {
      start: new Date(1970, 1, 1),
      end: new Date(2099, 1, 1)
    };

  query.timeframe.start.setMilliseconds(0);
  query.timeframe.end.setMilliseconds(999);
  */

  query._interval = query.interval;
  query.interval = manager.translateInterval(query.interval);

  context.query = query;

  //dimension processing
  manager.parseDimensions(context, query.dimensions, function (err, dimensions) {
    query.dimensions = dimensions;


    //metric processing
    manager.parseMetrics(context, query.metrics, function (err, metrics) {
      query.metrics = metrics;

      var calls = [];
      if (query.metrics) {
        query.metrics.forEach(function (m) {
          //if this is calculated just pass it along
          if (m.formula) {
            m.formula.dependsOn.forEach(function (dependent) {
              dependent.collection = dependent.collection || query.collection;
              calls.push(function (callback) {
                manager.parseMetric(context, dependent, function (err, _dep) {
                  if (err) {
                    return setImmediate(function () {
                      return callback(err);
                    });
                  }
                  var exists = _.find(query.metrics, function (qm) {
                    return qm.key == _dep.key;
                  });
                  if (!exists) {
                    _dep.dependent = true;
                    query.metrics[query.metrics.length] = _dep;
                  }

                  return setImmediate(function () {
                    return callback(null, query);
                  });
                });
              });
            });
          }
        });
      }
      if (calls.length > 0) {
        async.series(calls, function (err) {
          return setImmediate(function () {
            return callback(null, query);
          });
        });
      }
      else {
        return setImmediate(function () {
          return callback(null, query);
        });
      }
    });
  });
};

manager.applyFilters = function (query, callback) {
  return setImmediate(function () {
    return callback(null, query);
  });
};

manager.translateTimeframe = function (timeframe, interval) {
  var _enddate = new Date();
  //_enddate.setMilliseconds(0);
  //_enddate.setSeconds(_enddate.getSeconds() - 1);
  var _startdate = new Date(_enddate);

  switch (timeframe) {
    case 'this_second':
      timeframe = 'this_1_second';
      break;
    case 'this_minute':
      timeframe = 'this_1_minute';
      break;
    case 'this_hour':
      timeframe = 'this_1_hour';
      break;
    case 'this_day':
      timeframe = 'this_1_day';
      break;
    case 'this_week':
      timeframe = 'this_1_week';
      break;
    case 'this_month':
      timeframe = 'this_1_month';
      break;
    case 'this_year':
      timeframe = 'this_1_year';
      break;

    case 'last_second':
      timeframe = 'last_1_second';
      break;
    case 'last_minute':
      timeframe = 'last_1_minute';
      break;
    case 'last_hour':
      timeframe = 'last_1_hour';
      break;
    case 'last_day':
      timeframe = 'last_1_day';
      break;
    case 'last_week':
      timeframe = 'last_1_week';
      break;
    case 'last_month':
      timeframe = 'last_1_month';
      break;
    case 'last_year':
      timeframe = 'last_1_year';
      break;
    default:
      break;
  }

  var m;
  m = /this_(\d+)_second/.exec(timeframe);
  if (m && m.length > 0) {
    _startdate = new Date(_enddate);
    _startdate.setMilliseconds(0);
    _startdate.setSeconds(_startdate.getSeconds() - (m[1] - 1));
    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /this_(\d+)_minute/.exec(timeframe);
  if (m && m.length > 0) {
    _startdate = new Date(_enddate);
    _startdate.setMilliseconds(0);
    _startdate.setSeconds(0);
    _startdate.setMinutes(_startdate.getMinutes() - (m[1] - 1));
    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /this_(\d+)_hour/.exec(timeframe);
  if (m && m.length > 0) {
    _startdate = new Date(_enddate);
    _startdate.setMilliseconds(0);
    _startdate.setSeconds(0);
    _startdate.setMinutes(0);
    _startdate.setHours(_startdate.getHours() - (m[1] - 1));
    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /this_(\d+)_day/.exec(timeframe);
  if (m && m.length > 0) {
    _startdate = new Date(_enddate);
    _startdate.setMilliseconds(0);
    _startdate.setSeconds(0);
    _startdate.setMinutes(0);
    _startdate.setHours(0);
    _startdate.setDate(_startdate.getDate() - (m[1] - 1));
    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /this_(\d+)_month/.exec(timeframe);
  if (m && m.length > 0) {
    _startdate = new Date(_enddate);
    _startdate.setMilliseconds(0);
    _startdate.setSeconds(0);
    _startdate.setMinutes(0);
    _startdate.setHours(0);
    _startdate.setDate(0);
    _startdate.setMonth(_startdate.getMonth() - (m[1] - 1));
    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /this_(\d+)_year/.exec(timeframe);
  if (m && m.length > 0) {
    _startdate = new Date(_enddate);
    _startdate.setMilliseconds(0);
    _startdate.setSeconds(0);
    _startdate.setMinutes(0);
    _startdate.setHours(0);
    _startdate.setDate(0);
    _startdate.setMonth(0);
    _startdate.setYear(_startdate.getYear() - (m[1] - 1) + 1900);
    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /last_(\d+)_second/.exec(timeframe);
  if (m && m.length > 0) {

    _startdate.setSeconds(_startdate.getSeconds() - (m[1]));
    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /last_(\d+)_minute/.exec(timeframe);
  if (m && m.length > 0) {
    _startdate.setMinutes(_startdate.getMinutes() - (m[1]));

    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /last_(\d+)_hour/.exec(timeframe);
  if (m && m.length > 0) {
    _startdate.setHours(_startdate.getHours() - (m[1]));

    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /last_(\d+)_day/.exec(timeframe);
  if (m && m.length > 0) {

    _startdate.setDate(_startdate.getDate() - (m[1]));

    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /last_(\d+)_month/.exec(timeframe);
  if (m && m.length > 0) {
    _startdate.setMonth(_startdate.getMonth() - (m[1]));

    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /last_(\d+)_year/.exec(timeframe);
  if (m && m.length > 0) {
    _startdate.setYear(_startdate.getYear() - (m[1] ) + 1900);

    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
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
    case 'day':
      return 'timebucket.ddate';
    case 'month':
      return 'timebucket.month';
    case 'year':
      return 'timebucket.year';
    default:
      return 'timebucket.ddate';
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

  if (!query.dimensions)
    query.dimensions = [];
  if (!query.metrics)
    query.metrics = [];

  console.log('q', query);

  if (query.timeframe) {
    if (typeof query.timeframe.start === 'string')
      query.timeframe.start = new Date(query.timeframe.start);
    if (typeof query.timeframe.end === 'string')
      query.timeframe.end = new Date(query.timeframe.end);
    $match.timestamp = {$gte: query.timeframe.start, $lt: query.timeframe.end};
  }

  if (query.filter) {
    query.filter.forEach(function (f) {
      if (f[1] == 'eq')
        $match[f[0]] = f[2];
      else {
        $match[f[0]] = {};
        $match[f[0]]['$' + f[1]] = f[2];
      }
    });
  }

  $group._id = {};
  query.dimensions.forEach(function (dimension) {
    switch (dimension.datatype) {
      case 'date':
        $group._id[dimension.key] = '$' + dimension.key + '_' + query.interval;
        break;
      case 'ip':
      case 'number':
      case 'string':
        $group._id[dimension.key] = '$' + (dimension.attribute || dimension.key);
        break;
      case 'geo':
        break;
      default:
        return setImmediate(function () {
          return callback(new Error('Dimension [' + dimension.key + '] has unknown type of [' + dimension.datatype + ']'));
        });
    }
  });

  query.metrics.forEach(function (metric) {
    var colQuery = {
      collection: metric.collection ? metric.collection.key : null,
      query: []
    };

    if (!metric.formula && metric.collection) {

      if (metric.aggregation == 'ucount')
        colQuery.type = 'ucount';
      else
        colQuery.type = 'plain';

      var _$match = joola.common.extend({}, $match);

      var _$unwind;// = '$' + metric.dependsOn || metric._key;
      if (metric.dependsOn.indexOf('.') > 0 && joola.common.checkNestedArray(metric.collection, metric.dependsOn))
        _$unwind = '$' + metric.dependsOn.substring(0, metric.dependsOn.indexOf('.')) || metric._key;
      var _$project = joola.common.extend({}, $project);
      var _$group = joola.common.extend({}, $group);


      if (metric.filter) {
        metric.filter.forEach(function (f) {
          if (f[1] == 'eq')
            _$match[f[0]] = f[2];
          else {
            _$match[f[0]] = {};
            _$match[f[0]]['$' + f[1]] = f[2];
          }
        });
      }
      colQuery.key = joola.common.hash(colQuery.type + '_' + metric.collection.key + '_' + JSON.stringify(_$match) + JSON.stringify(_$unwind));

      if (colQuery.type == 'plain') {
        if (plan.colQueries[colQuery.key]) {
          if (_$unwind)
            _$group = joola.common.extend({}, plan.colQueries[colQuery.key].query[3].$group);
          else
            _$group = joola.common.extend({}, plan.colQueries[colQuery.key].query[2].$group);
        }

        _$group[metric.key] = {};
        if (metric.aggregation == 'count')
          _$group[metric.key].$sum = 1;
        /*else if (metric.aggregation == 'avg') {
         _$group[metric.key]['$' + (typeof metric.aggregation === 'undefined' ? 'sum' : metric.aggregation)] = '$' + metric.attribute;
         _$group[metric.key + '_count'] = {};
         _$group[metric.key + '_total'] = {};
         _$group[metric.key + '_count'].$sum = 1;
         _$group[metric.key + '_total'].$sum = '$' + metric.attribute;
         }*/
        else
          _$group[ metric.key]['$' + (typeof metric.aggregation === 'undefined' ? 'sum' : metric.aggregation)] = '$' + metric.attribute;

        if (_$unwind) {
          colQuery.query = [
            {$match: _$match},
            {$unwind: _$unwind},
            {$sort: {timestamp: -1}},
            // {$project: _$project},
            {$group: _$group}
          ];
        }
        else {
          colQuery.query = [
            {$match: _$match},
            {$sort: {timestamp: -1}},
            // {$project: _$project},
            {$group: _$group}
          ];
        }
      }
      else {
        var _$group2;

        _$group[metric.dependsOn] = {'$addToSet': '$' + metric.dependsOn};
        _$unwind = '$' + metric.dependsOn;
        _$group2 = {'_id': '$_id'};
        _$group2[metric.key] = {'$sum': 1};
        colQuery.query = [
          {$match: _$match},
          {$sort: {timestamp: -1}},
          // {$project: _$project},
          {$group: _$group},
          {$unwind: _$unwind},
          {$group: _$group2}

        ];
      }
      plan.colQueries[colQuery.key] = colQuery;
    }
  });

  if (false && plan.colQueries && Object.keys(plan.colQueries).length > 0) {
    Object.keys(plan.colQueries).forEach(function (key) {
      var colQuery = plan.colQueries[key];
      if (colQuery.query.length > 0) {
        if (colQuery.query.length === 4) {
          var _$match = ce.clone(colQuery.query[0].$match);
          if (_$match.timestamp) {
            _$match.timestamp.$gte = _$match.timestamp.$gte.toISOString();
            _$match.timestamp.$lt = _$match.timestamp.$lt.toISOString();
          }
          console.log(new Date().toISOString(), '$match', _$match);
          console.log('$unwind', colQuery.query[1]);
          console.log('$sort', colQuery.query[2]);
          console.log('$group', colQuery.query[3]);
        }
        else {
          console.log('$match', colQuery.query[0]);
          console.log('$sort', colQuery.query[1]);
          console.log('$group', colQuery.query[2]);
          console.log('$unwind', colQuery.query[3]);
          console.log('$group2', colQuery.query[4]);
        }
      }
    });
  }

  plan.dimensions = query.dimensions;
  plan.metrics = query.metrics;

  return setImmediate(function () {
    return callback(null, plan);
  });
};

manager.executePlan = function (context, queryplan, callback) {
  var result = {
    dimensions: [],
    metrics: [],
    documents: [],
    queryplan: queryplan
  };

  var arrCols = _.toArray(queryplan.colQueries);

  if (arrCols.length === 0) {
    var output = {
      queryplan: queryplan
    };
    output.dimensions = queryplan.dimensions;
    output.metrics = queryplan.metrics;
    output.documents = [];
    return setImmediate(function () {
      return callback(null, output);
    });
  }

  return async.map(arrCols, function iterator(_query, next) {
    var storeName = 'cache';
    var collectionName = context.user.workspace + '_' + _query.collection;
    if (queryplan.merge) {
      storeName = 'results';
      collectionName = queryplan.colQueries.fixedkey.collection;
    }

    if (joola.config.cache.crunch) {
      if (queryplan.query._interval === 'raw') {

      }
      else if (queryplan.query._interval === 'day')
        storeName += '-ddate';
      else
        storeName += '-' + queryplan.query._interval;
    }

    mongo.aggregate(storeName, collectionName, _query.query, {}, function (err, results) {
      if (err)
        return next(err);

      result.dimensions = queryplan.dimensions;
      result.metrics = queryplan.metrics;

      //prevent circular references on output.
      result.metrics.forEach(function (m, i) {
        if (!m.formula) {
          if (m.collection)
            m.collection = m.collection.key;
          result.metrics[i] = m;
        }
      });
      result.documents = results;
      return next(null, joola.common.extend({}, result));

    });
  }, function (err, results) {
    if (err)
      return setImmediate(function () {
        return callback(err);
      });

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
            if (!row[m.key])
              row[m.key] = null;
          });
          output.dimensions.forEach(function (d) {
            if (typeof row[d.key] === 'undefined') {
              row[d.key] = '(not set)';
            }
          });

          final[keys.indexOf(key)] = row;
        });
      });
      output.documents = final;
      return setImmediate(function () {
        return callback(null, output);
      });
    }
    else {
      output.dimensions = queryplan.dimensions;
      output.metrics = queryplan.metrics;
      output.documents = [];
      return setImmediate(function () {
        return callback(null, output);
      });
    }
  });
};

manager.formatResults = function (results, callback) {
  var query = results.queryplan.query;

  results.documents = results.documents || [];

  results.dimensions = results.dimensions || query.dimensions;
  results.metrics = results.metrics || query.metrics;

  var timestampDimension = _.find(results.dimensions, function (d) {
    return d.datatype === 'date';
  });

  var templateItem = {values: {}, fvalues: {}};
  var interval, itr, _documents, _templateItem, _d, exists;

  var checkExists = function (timestampDimension, documents, date, fix) {
    return _.find(documents, function (document) {
      if (fix) {
        return document.values[timestampDimension.key].getTime() === fixOffset(date).getTime();
      }
      else
        return document.values[timestampDimension.key].getTime() === date.getTime();

    });
  };

  if (results.documents && results.documents.length > 0) {
    results.documents.forEach(function (document, dindex) {
      document.values = {};
      document.fvalues = {};

      delete document.key;
      results.dimensions.forEach(function (dimension) {
        document.values[dimension.key] = document[dimension.key];
        if (dimension.datatype == 'date') {
          document.fvalues[dimension.key] = document.values[dimension.key];
        }
        else if (dimension.datatype === 'ip' && document[dimension.key] && document[dimension.key] !== '(not set)') {
          var ip = document[dimension.key];
          document.fvalues[dimension.key] = joola.common.extend({ip: ip}, joola.common.geoip.lookup(ip)) || '(not set)';
        }
        else if (dimension.datatype === 'geo') {

        }
        else {
          document.fvalues[dimension.key] = document.values[dimension.key];
        }

        if (dimension.transform) {
          try {
            var transformFn = localeval('(' + dimension.transform + ')');
            document.fvalues[dimension.key] = transformFn.apply(dimension, [document.values[dimension.key]]);
          }
          catch (ex) {
            document.fvalues[dimension.key] = null;
          }
        }

        //document.fvalues[dimension.id] = document.values[dimension.id];
      });
      results.metrics.forEach(function (metric) {
        document.values[metric.key] = document[metric.key];
        document.fvalues[metric.key] = document.values[metric.key];

        if (metric.formula) {
          var calc;
          try {
            calc = localeval('(' + metric.formula.run + ')');
          }
          catch (ex) {
            console.log(ex);
            calc = null;
          }
          var args = [];
          metric.formula.dependsOn.forEach(function (dep) {
            if (typeof dep === 'object')
              args.push(document[dep.key]);
            else
              args.push(document[dep]);
          });

          try {
            document.values[metric.key] = calc.apply(document, args);
            document.fvalues[metric.key] = document.values[metric.key].toString();
          }
          catch (ex) {
            document.values[metric.key] = null;
            document.fvalues[metric.key] = null;
          }
        }

        if (metric.transform) {
          try {

            var transformFn = localeval('(' + metric.transform + ')');
            document.fvalues[metric.key] = transformFn.apply(metric, [document.values[metric.key]]);
          }
          catch (ex) {
            console.log(ex);
            document.fvalues[metric.key] = null;
          }
        }

        if (metric.hasOwnProperty('decimals')) {
          if (document.values[metric.key])
            document.fvalues[metric.key] = document.values[metric.key].toFixed(metric.decimals);
        }
        else {
          try {
            document.values[metric.key] = Math.round(document.values[metric.key] * 100) / 100;
          }
          catch (ex) {

          }
        }

        if (document.values[metric.key]) {
          if (metric.prefix)
            document.fvalues[metric.key] = metric.prefix + document.fvalues[metric.key].toString();
          if (metric.suffix)
            document.fvalues[metric.key] = document.fvalues[metric.key].toString() + metric.suffix;
        }
        else {
          document.fvalues[metric.key] = null;
        }

      });

      Object.keys(document).forEach(function (key) {
        if (['values', 'fvalues'].indexOf(key) == -1) {
          delete document[key];
        }
      });

      results.metrics.forEach(function (metric) {
        if (metric.dependent) {
          delete document.values[metric.key];
          delete document.fvalues[metric.key];
        }
      });
      results.documents[dindex] = document;
    });

    if (timestampDimension) {
      interval = query.interval.replace('timebucket.', '');
      interval = interval === 'ddate' ? 'day' : interval;
      if (!query.timeframe) {
        query.timeframe = {};
        query.timeframe.start = results.documents[results.documents.length - 1].values.timestamp;
        query.timeframe.end = results.documents[0].values.timestamp;
      }

      itr = moment.twix(query.timeframe.start, query.timeframe.end).iterate(interval);
      _documents = [];
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
          templateItem.values[d.key] = null;
          templateItem.fvalues[d.key] = null;
        });
        results.metrics.forEach(function (m) {
          templateItem.values[m.key] = null;
          templateItem.fvalues[m.key] = null;
        });
      }
      while (itr.hasNext()) {
        _d = new Date(itr.next()._d.getTime());
        if (['day', 'month', 'year'].indexOf(interval) > -1)
          exists = checkExists(timestampDimension, results.documents, _d, true);
        else
          exists = checkExists(timestampDimension, results.documents, _d);
        /*exists = _.find(results.documents, function (document) {
         return document.values[timestampDimension.key].getTime() === _d.getTime();
         });*/

        if (exists)
          _documents.push(exists);
        else {
          _templateItem = joola.common.extend({}, templateItem);
          _templateItem.values[timestampDimension.key] = new Date(_d);
          _templateItem.fvalues[timestampDimension.key] = new Date(_d.getTime());
          _documents.push(ce.clone(_templateItem));
        }
      }
      results.documents = _documents;
    }
  }
  else if (results.documents.length === 0 && timestampDimension) {
    interval = query.interval.replace('timebucket.', '');
    if (interval === 'ddate')
      interval = 'day';
    if (!query.timeframe) {
      query.timeframe = {};
      query.timeframe.start = results.documents[results.documents.length - 1].values.timestamp;
      query.timeframe.end = results.documents[0].values.timestamp;
    }

    itr = moment.twix(query.timeframe.start, query.timeframe.end).iterate(interval);
    _documents = [];
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
        templateItem.values[d.key] = null;
        templateItem.fvalues[d.key] = null;
      });
      results.metrics.forEach(function (m) {
        templateItem.values[m.key] = null;
        templateItem.fvalues[m.key] = null;
      });
    }

    while (itr.hasNext()) {
      _d = new Date(itr.next()._d.getTime());
      if (interval === 'day')
        exists = checkExists(timestampDimension, results.documents, _d, true);
      else
        exists = checkExists(timestampDimension, results.documents, _d);
      /*
       exists = _.find(results.documents, function (document) {
       return document.values[timestampDimension.key].getTime() === _d.getTime();
       });*/

      if (exists)
        _documents.push(exists);
      else {
        _templateItem = joola.common.extend({}, templateItem);
        _templateItem.values[timestampDimension.key] = new Date(_d);
        _templateItem.fvalues[timestampDimension.key] = new Date(_d.getTime());
        _documents.push(ce.clone(_templateItem));
      }
    }
    results.documents = _documents;
  }
  else {
    /*
     _templateItem = joola.common.extend({}, templateItem);
     results.dimensions.forEach(function (d) {
     _templateItem.values[d.key || d] = null;
     _templateItem.fvalues[d.key || d] = null;
     });
     results.metrics.forEach(function (m) {
     _templateItem.values[m.key || m] = null;
     _templateItem.fvalues[m.key || m] = null;
     });
     results.documents.push(ce.clone(_templateItem));*/
  }

  //sort
  results.documents = _.sortBy(results.documents, function (document) {
    return document.values[Object.keys(document.values)[0]];
  });

  query.ts.end = new Date();
  query.ts.duration = query.ts.end.getTime() - query.ts.start.getTime();

  var _metrics = [];
  results.metrics.forEach(function (metric, i) {
    if (!metric.dependent)
      _metrics.push(metric);
  });
  results.metrics = _metrics;

  results.uid = results.queryplan.query.uid;
  results.cost = results.queryplan.query.cost;
  results.resultCount = results.documents.length;

  if (results.queryplan.query.timeframe) {
    results.queryplan.query.timeframe.start = new Date(results.queryplan.query.timeframe.start).toISOString();
    results.queryplan.query.timeframe.end = new Date(results.queryplan.query.timeframe.end).toISOString();
  }

  results.queryplan.dimensions.forEach(function (d) {
    delete d.collection;
  });
  results.queryplan.metrics.forEach(function (m) {
    delete m.collection;
  });
  results.query = query;
  delete results.queryplan;

  return setImmediate(function () {
    return callback(null, results);
  });
};

manager.sendResults = function (results, callback) {
  return callback(null, results);
};

manager.runningQueries = [];
manager.realtimeQueries = {};

exports.stop = {
  name: "/api/query/stop",
  description: "",
  inputs: ['querytoken'],
  _outputExample: {},
  _permission: ['access_system'],
  _dispatch: {
    message: 'query:stop'
  },
  _route: function (req, res) {
    var _params = {};
    Object.keys(req.params).forEach(function (p) {
      if (p != 'resource' && p != 'action')
        _params[p] = req.params[p];
    });

    var querytoken = _params.querytoken;
    joola.logger.debug('Stopping query [' + querytoken + ']');
    var index = manager.runningQueries.indexOf(querytoken);
    manager.runningQueries.splice(index, 1);

    if (manager.realtimeQueries[querytoken]) {
      var sid = res.socket.id;
      delete manager.realtimeQueries[querytoken].sockets[sid];
    }
    return router.responseSuccess({ok: 1}, req, res);
  }
};

exports.queryKey = function (query) {
  return joola.common.hash(JSON.stringify(query));
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
    var _token = req.token;
    var lastQueryEndDate;
    var timestampDimension;
    var _params = {};
    Object.keys(req.params).forEach(function (p) {
      if (p != 'resource' && p != 'action')
        _params[p] = req.params[p];
    });
    var aborted, timerID;

    var queryKey = exports.queryKey(_params.options);

    var request = function (firstRun, callback) {
      //_params.options.timeframe.end.setMilliseconds(0);
      if (!firstRun && lastQueryEndDate && timestampDimension) {
        _params.options.timeframe_force_start = lastQueryEndDate;

        switch (_params.options.interval) {
          case 'second':
            _params.options.timeframe_force_start.setMilliseconds(0);
            break;
          case 'minute':
            _params.options.timeframe_force_start.setSeconds(0);
            _params.options.timeframe_force_start.setMilliseconds(0);
            break;
          case 'hour':
            _params.options.timeframe_force_start.setMinutes(0);
            _params.options.timeframe_force_start.setSeconds(0);
            _params.options.timeframe_force_start.setMilliseconds(0);
            break;
          case 'day':
            _params.options.timeframe_force_start.setHours(0);
            _params.options.timeframe_force_start.setMinutes(0);
            _params.options.timeframe_force_start.setSeconds(0);
            _params.options.timeframe_force_start.setMilliseconds(0);
            break;
          case 'month':
            _params.options.timeframe_force_start.setDate(1);
            _params.options.timeframe_force_start.setHours(0);
            _params.options.timeframe_force_start.setMinutes(0);
            _params.options.timeframe_force_start.setSeconds(0);
            _params.options.timeframe_force_start.setMilliseconds(0);
            break;
          case 'year':
            _params.options.timeframe_force_start.setMonth(0);
            _params.options.timeframe_force_start.setDate(1);
            _params.options.timeframe_force_start.setHours(0);
            _params.options.timeframe_force_start.setMinutes(0);
            _params.options.timeframe_force_start.setSeconds(0);
            _params.options.timeframe_force_start.setMilliseconds(0);
            break;
          default:
            break;
        }
      }

      joola.auth.extendToken(req.token, function (err, token) {
        joola.dispatch.request(token._, 'query:fetch', _params, function (err, result) {
          clearTimeout(timerID);
          if (aborted)
            return;
          if (err)
            if (callback)
              return callback(new router.ErrorTemplate('Failed to route action [' + 'fetch' + ']: ' + (typeof(err) === 'object' ? err.message : err)));
            else
              return router.responseError(new router.ErrorTemplate('Failed to route action [' + 'fetch' + ']: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

          lastQueryEndDate = new Date(result.query.timeframe.end);
          timestampDimension = _.find(result.dimensions, function (d) {
            return d.datatype == 'date';
          });

          if (callback)
            return callback(null, result);
          else {
            if (result.query && result.query.realtimeUID)
              result.realtime = result.query.realtimeUID;
            return router.responseSuccess(result, req, res);
          }
        });

        timerID = setTimeout(function () {
          if (callback)
            return callback(new router.ErrorTemplate('Timeout while waiting for [' + 'fetch' + ']'));
          else
            return router.responseError(new router.ErrorTemplate('Timeout while waiting for [' + 'fetch' + ']'), req, res);

        }, 15000);
      });
    };

    if (_params.options.realtime) {
      if (typeof _params.options.realtime === 'boolean') {
        _params.options.realtime = {
          enabled: _params.options.realtime,
          interval: 1000
        };
      }
      else if (typeof _params.options.realtime === 'object') {
        if (_params.options.realtime.interval < 1000)
          return router.responseError(new router.ErrorTemplate('Minimal realtime interval is 1000ms'));
      }
      else {
        _params.options.realtime = {enabled: false};
      }
      if (_params.options.realtime.enabled === true) {
        var exist = _.find(manager.realtimeQueries, function (q) {
          return q.key === queryKey;
        });
        if (exist) {
          exist.sockets[res.socket.id] = res;
        }
        else {
          exist = {
            key: queryKey,
            sockets: {}
          };
          exist.sockets[res.socket.id] = res;
          manager.realtimeQueries[queryKey] = exist;

          _params.options.queryKey = queryKey;
          var realtimeUID = queryKey;//joola.common.uuid();
          _params.options.realtimeUID = realtimeUID;
          manager.runningQueries.push(realtimeUID);
          var realtime = function () {
            request(false, function (err, result) {
              if (err)
                return;

              var sockets;
              if (manager.realtimeQueries[queryKey]) {
                sockets = manager.realtimeQueries[queryKey].sockets;
                _.each(sockets, function (res) {
                  if (res.socket.disconnected) {
                    joola.logger.trace('Removing socket [' + res.socket.id + '] due to disconnection from realtime query [' + queryKey + '].');
                    delete manager.realtimeQueries[queryKey].sockets[res.socket.id];
                  }
                  else {
                    result.realtime = realtimeUID;
                    return router.responseSuccess(result, req, res);
                  }
                });
              }
              if (!sockets || Object.keys(sockets).length === 0) {
                joola.logger.debug('Stopping realtime query [' + queryKey + '] due to inactivity.');
                delete manager.realtimeQueries[queryKey];
                clearInterval(intervalID);
              }
            });
          };
          var intervalID = setInterval(realtime, _params.options.realtime.interval);
        }
      }
    }
    request(true);
  },
  run: function (context, options, callback) {
    callback = callback || function () {
    };

    options = joola.common.extend({
      ts: {
        start: new Date()
      },
      uid: joola.common.uuid(),
      dimensions: [],
      metrics: [],
      timeframe: 'this_day',
      interval: 'minute',
      realtime: false,
      filter: null,
      dontcache: true //temp until #223 is resolved.
    }, options);

    manager.parse(context, options, function (err, query) {
      if (err)
        return callback(err);

      manager.applyFilters(query, function (err, query) {
        if (err)
          return callback(err);
        manager.buildQueryPlan(query, function (err, queryplan) {
          if (err)
            return callback(err);
          manager.executePlan(context, queryplan, function (err, results) {
            if (err)
              return callback(err);
            return manager.formatResults(results, callback);
          });
        });
      });
    });
  }
};