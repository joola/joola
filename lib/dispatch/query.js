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

manager.parseDimensions = function (context, dimensions, callback) {
  var _dimensions = [];

  var expected = 0;
  dimensions.forEach(function (d, i) {
    expected++;
    _dimensions[i] = manager.parseDimension(context, d);
  });

  return callback(null, _dimensions);
};

manager.parseDimension = function (context, d, callback) {
  var col;
  var dimension = {};

  if (d && typeof d === 'object') {
    col = _.find(joola.config.authentication.organizations[context.user.organization].collections, function (collection) {
      return collection[d.key];
    });

    if (!col) {
      /*
       var dimension = joola.common.extend({}, col[d.key]);
       dimension = joola.common.extend(dimension, d);
       dimension.attribute = m.key;
       dimension.adhoc = true;
       dimension.collection = col;*/
    }
    else {
      dimension = joola.common.extend({}, col[d.key]);
      dimension = joola.common.extend(dimension, d);
      //query.metric.fullkey = m.key + '_' + m.dependsOn;
      //query.metric.key = m.dependsOn;
      dimension.attribute = d.key;
      dimension.adhoc = true;
      dimension.collection = col;
    }
  }
  else if (d) {
    col = _.find(joola.config.authentication.organizations[context.user.organization].collections, function (collection) {
      return collection[d];
    });
    if (col) {
      dimension = joola.common.extend({}, col[d]);
      dimension.attribute = d;
      dimension.adhoc = false;
      dimension.collection = col;
    }
    else {
      if (d.indexOf('.') > 0) {
        Object.keys(joola.config.authentication.organizations[context.user.organization].collections).forEach(function (key) {
          var collection = joola.config.authentication.organizations[context.user.organization].collections[key];
          var parts = [];
          parts.push(collection);
          parts = parts.concat(d.split('.'));
          var exists = joola.common.checkNested.apply(this, parts);
          if (exists) {
            dimension = joola.common.extend({}, exists);
            parts.shift();
            dimension.fullkey = parts.join('.');
            dimension.attribute = d;
            dimension.adhoc = false;
            dimension.collection = collection;
          }
        });
      }
      else {
        //let's see if it's global
        //metricsValid = false;
        dimension = {};
        dimension.key = d;
        dimension.attribute = d;
        dimension.name = d;
        dimension.datatype = 'string';
        dimension.adhoc = true;
      }
    }
  }

  return dimension;
};

manager.parseMetrics = function (context, metrics, callback) {
  var _metrics = [];

  var expected = 0;
  metrics.forEach(function (m, i) {
    expected++;
    manager.parseMetric(context, m, function (err, metric) {
      expected--;
      if (err)
        return callback(err);
      _metrics.push(metric);

      if (expected === 0) {
        return callback(null, _metrics);
      }
    });
  });
};

manager.parseMetric = function (context, m, callback) {
  var col;
  var metric = {};

  if (!m)
    return callback(new Error('Failed to parse metric [' + m + ']'));


  var prepareMetric = function (collection, metric, parentMetric, callback) {
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

    return callback(null, metric);
  };


  if (typeof m === 'object') {
    //if this is a computed metric, simply pass it on
    if (m.formula)
      return callback(null, m);

    //if (m.aggregation==='ucount')
    // return callback(null, m);

    if (!m.dependsOn)
      m.dependsOn = m.key;

    //let's find the metric
    if (m.collection) {
      //we're looking for a specific collection containing this metric
      joola.dispatch.collections.get(context, context.user.organization, m.collection, function (err, collection) {
        if (err)
          return callback(err);

        col = collection[m.dependsOn] ? collection : null;

        if (!col && m.dependsOn.indexOf('.') > -1) {
          //let's see if we're dealing with a compound key
          if (joola.common.checkNested(collection, m.dependsOn))
            col = collection;
        }

        if (!col)
          return callback(new Error('Failed to locate collection for metric [' + metric.key + ']'));
        prepareMetric(col, m, col[m], callback);
      });
    }
    else {
      //let's iterate through collections until we find the first metric
      joola.dispatch.collections.list(context, context.user.organization, function (err, collections) {
        if (err)
          return callback(err);

        col = _.find(collections, function (collection) {
          return collection[m.dependsOn];
        });
        if (!col && m.dependsOn.indexOf('.') > -1) {
          //let's see if we're dealing with a compound key
          col = _.find(collections, function (collection) {
            if (joola.common.checkNested(collection, m.dependsOn))
              return collection;
          });
          prepareMetric(col, m, joola.common.checkNested(col, m.dependsOn), callback);
        }
        else if (col)
          prepareMetric(col, m, col[m], callback);
        else
          prepareMetric(null, m, {}, callback);
        //if (!col)
        //  return callback(new Error('Failed to locate collection for metric [' + metric.key + ']'));
      });
    }
  }
  else {
    joola.dispatch.collections.list(context, context.user.organization, function (err, collections) {
      if (err)
        return callback(err);

      col = _.find(collections, function (collection) {
        if (m.indexOf('.') > 0) {
          if (joola.common.checkNested(collection, m))
            return collection;
        }
        else {
          return collection[m];
        }
      });

      if (!col)
        return callback(new Error('Failed to locate collection for metric [' + metric + ']'));

      if (col[m])
        prepareMetric(col, null, col[m], callback);
      else {
        var ref = joola.common.checkNested(col, m);
        ref.attribute = m;
        prepareMetric(col, null, ref, callback);
      }
    });
  }

  return metric;
};

manager.parse = function (context, options, callback) {
  var query = joola.common.extend({}, options);

  //dimension processing
  manager.parseDimensions(context, query.dimensions, function (err, dimensions) {
    query.dimensions = dimensions;

    //metric processing
    manager.parseMetrics(context, query.metrics, function (err, metrics) {
      query.metrics = metrics;

      var calls = [];
      query.metrics.forEach(function (m) {
        //if this is calculated just pass it along
        if (m.formula) {
          m.formula.dependsOn.forEach(function (dependent) {
            calls.push(function (callback) {
              manager.parseMetric(context, dependent, function (err, _dep) {
                if (err)
                  return callback(err);

                var exists = _.find(query.metrics, function (qm) {
                  return qm.key == _dep.key;
                });
                if (!exists) {
                  _dep.dependent = true;
                  query.metrics[query.metrics.length] = _dep;
                }

                return callback(null, query);
              });
            });
          });
        }
      });
      if (calls.length > 0) {
        async.series(calls, function (err) {
          return callback(null, query);
        });
      }
      else
        return callback(null, query);
    });
  });
};

manager.applyFilters = function (query, callback) {
  return callback(null, query);
};

manager.translateTimeframe = function (timeframe, interval) {
  var _startdate = new Date();
  var _enddate = new Date();

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

  m = /last_(\d+)_second/.exec(timeframe);
  if (m && m.length > 0) {
    _enddate.setMilliseconds(999);
    _enddate.setSeconds(_enddate.getSeconds() - 1);
    _startdate = new Date(_enddate);
    _startdate.setMilliseconds(0);
    _startdate.setSeconds(_startdate.getSeconds() - (m[1] - 1));
    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /last_(\d+)_minute/.exec(timeframe);
  if (m && m.length > 0) {
    _enddate.setMilliseconds(999);
    _enddate.setSeconds(59);
    _enddate.setMinutes(_enddate.getMinutes() - 1);
    _startdate = new Date(_enddate);
    _startdate.setMilliseconds(0);
    _startdate.setSeconds(0);
    _startdate.setMinutes(_startdate.getMinutes() - (m[1] - 1));

    return {
      start: new Date(_startdate),
      end: new Date(_enddate)
    };
  }

  m = /last_(\d+)_hour/.exec(timeframe);
  if (m && m.length > 0) {
    _enddate.setMilliseconds(999);
    _enddate.setSeconds(59);
    _enddate.setMinutes(59);
    _enddate.setHours(_enddate.getHours() - 1);
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

  m = /last_(\d+)_day/.exec(timeframe);
  if (m && m.length > 0) {
    _enddate.setMilliseconds(999);
    _enddate.setSeconds(59);
    _enddate.setMinutes(59);
    _enddate.setHours(23);
    _enddate.setDate(_enddate.getDate() - 1);
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
      return 'timebucket.date';
    case 'month':
      return 'timebucket.month';
    case 'year':
      return 'timebucket.year';
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
      query.timeframe = manager.translateTimeframe(query.timeframe, query.interval);

    if (query.timeframe_force_end)
      query.timeframe.end = new Date(query.timeframe_force_end);

    if (query.timeframe_force_start)
      query.timeframe.start = new Date(query.timeframe_force_start);

    if (!query.timeframe.start || !query.timeframe.end)
      return callback(new Error('Failed to translate timeframe provided into proper timeframe object'));

    $match.timestamp = {$gte: query.timeframe.start, $lte: query.timeframe.end};
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
  query.interval = manager.translateInterval(query.interval);


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
        return callback(new Error('Dimension [' + dimension.key + '] has unknown type of [' + dimension.datatype + ']'));
    }
  });

  query.metrics.forEach(function (metric) {
    var colQuery = {
      collection: metric.collection ? metric.collection.id : null,
      query: []
    };

    if (!metric.formula && metric.collection) {

      if (metric.aggregation == 'ucount')
        colQuery.type = 'ucount';
      else
        colQuery.type = 'plain';

      var _$match = joola.common.extend({}, $match);
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
      colQuery.key = joola.common.hash(colQuery.type + '_' + metric.collection.id + '_' + JSON.stringify(_$match));

      if (colQuery.type == 'plain') {
        if (plan.colQueries[colQuery.key]) {
          _$group = joola.common.extend({}, plan.colQueries[colQuery.key].query[1].$group);
        }

        _$group[metric.key] = {};
        if (metric.aggregation == 'count')
          _$group[metric.key].$sum = 1;
        else
          _$group[ metric.key]['$' + (typeof metric.aggregation === 'undefined' ? 'sum' : metric.aggregation)] = '$' + metric.attribute;
        colQuery.query = [
          {$match: _$match},
          // {$project: _$project},
          {$group: _$group},
          {$sort: {timestamp: -1}}
        ];
        //console.log('$match', _$match);
        //console.log('g', _$group);
      }
      else {
        var _$unwind, _$group2;

        _$group[metric.dependsOn] = {'$addToSet': '$' + metric.dependsOn};
        _$unwind = '$' + metric.dependsOn;
        _$group2 = {'_id': '$_id'};
        _$group2[metric.key] = {'$sum': 1};
        colQuery.query = [
          {$match: _$match},
          // {$project: _$project},
          {$group: _$group},
          {$unwind: _$unwind},
          {$group: _$group2},
          {$sort: {timestamp: -1}}
        ];

        //console.log('g', _$group);
        //console.log('u', _$unwind);
        //console.log('g2', _$group2);
      }

      plan.colQueries[colQuery.key] = colQuery;
    }
  });

  plan.dimensions = query.dimensions;
  plan.metrics = query.metrics;

  return callback(null, plan);
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
    return callback(null, output);
  }

  return async.map(arrCols, function iterator(_query, next) {
    mongo.aggregate('cache', context.user.organization + '_' + _query.collection, _query.query, {}, function (err, results) {
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
      return callback(null, output);
    }
    else {
      output.dimensions = queryplan.dimensions;
      output.metrics = queryplan.metrics;
      output.documents = [];
      return callback(null, output);
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

  var checkExists = function (timestampDimension, documents, date) {
    return _.find(documents, function (document) {
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
          document.values[metric.key] = document.values[metric.key].toFixed(metric.decimals);
          document.fvalues[metric.key] = document.values[metric.key].toString();
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
        else
          document.fvalues[metric.key] = null;

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
      interval = interval === 'date' ? 'day' : interval;
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
    if (interval === 'date')
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
  results.stats = {
    times: query.ts
  };

  var _metrics = [];
  results.metrics.forEach(function (metric, i) {
    if (!metric.dependent)
      _metrics.push(metric);
  });
  results.metrics = _metrics;

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
    var _token = req.token;

    var lastQueryEndDate;
    var timestampDimension;
    var _params = {};
    Object.keys(req.params).forEach(function (p) {
      if (p != 'resource' && p != 'action')
        _params[p] = req.params[p];
    });
    var aborted, timerID;

    var request = function (callback) {
      //if (lastQueryEndDate && timestampDimension)
      //_params.options.timeframe_force_start = lastQueryEndDate;

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

          lastQueryEndDate = new Date(result.queryplan.query.timeframe.end);
          timestampDimension = _.find(result.dimensions, function (d) {
            return d.datatype == 'date';
          });

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
      });
    };

    if (_params.options.realtime) {
      var realtime = function () {
        request(function (err, result) {
          if (err)
            return;

          if (res.socket.disconnected)
            clearInterval(intervalID);
          else {
            result.realtime = true;
            return router.responseSuccess(result, req, res);
          }
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
      // timeframe: 'this_30_days',
      realtime: false,
      filter: null
    }, options);

    manager.parse(context, options, function (err, query) {
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

            manager.executePlan(context, queryplan, function (err, results) {
              if (err)
                return callback(err);

              manager.formatResults(results, function (err, results) {
                if (err)
                  return callback(err);

                manager.saveToCache(results, function (err) {
                  if (err)
                    return callback(err);

                  /*joola.stats.set('querytime', {
                   querytime$avg: results.stats.times.duration
                   });*/
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