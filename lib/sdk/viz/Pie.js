/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

var _ = require('underscore');


var Pie = module.exports = function (options, callback) {
  if (!callback)
    callback = function () {
    };
  joolaio.events.emit('pie.init.start');

  //mixin
  this._super = {};
  for (var x in require('./_proto')) {
    this[x] = require('./_proto')[x];
    this._super[x] = require('./_proto')[x];
  }

  var self = this;

  this._id = '_pie';
  this.uuid = joolaio.common.uuid();
  this.options = {
    legend: true,
    container: null,
    $container: null,
    query: null
  };
  this.chartDrawn = false;

  this.verify = function (options, callback) {
    return this._super.verify(options, callback);
  };

  this.draw = function (options, callback) {
    return this._super.fetch(this.options.query, function (err, message) {
      if (err) {
        if (typeof callback === 'function')
          return callback(err);
        else
          throw err;
      }

      var series = self._super.makePieChartSeries(message.dimensions, message.metrics, message.documents);
      if (!self.chartDrawn) {
        var chartOptions = joolaio.common.extend({
          title: {
            text: null
          },
          chart: {
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            spacingTop: 0,
            spacingBottom: 0,
            spacingLeft: 0,
            spacingRight: 0,
            borderWidth: 0,
            plotBorderWidth: 0,
            type: 'pie'
          },
          series: series,

          legend: {enabled: false},
          credits: {enabled: false},
          exporting: {enabled: true},
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                color: '#000000',
                connectorColor: '#000000',
                format: '<b>{point.name}</b>: {point.percentage:.1f} %'
              }
            }
          }
        }, self.options.chart);
        self.chart = self.options.$container.highcharts(chartOptions);

        self.chart = self.chart.highcharts();
        self.chartDrawn = true;
        if (typeof callback === 'function')
          return callback(null);
      }
      else if (self.options.query.realtime) {
        //we're dealing with realtime
        series.forEach(function (ser, serIndex) {
          var found = false;
          self.chart.series[serIndex].points.forEach(function (point) {
            //var exist = _.find(series, function (s) {
            var exist = _.find(ser.data, function (p) {
              point.update(p[1]);
              return p[0] == point.name;
            });
            //});
            if (!exist)
              point.remove();
          });
          ser.data.forEach(function (point) {
            var exist = _.find(self.chart.series[serIndex].points, function (p) {
              return p.name == point[0];
            });
            if (!exist)
              self.chart.series[serIndex].addPoint([point[0], point[1]]);
          });
        });
      }
    });
  };

  //here we go
  try {
    joolaio.common.mixin(self.options, options, true);
    self.verify(self.options, function (err) {
      if (err)
        return callback(err);

      self.options.$container = $(self.options.container);
      self.markContainer(self.options.$container, [
        {'type': 'pie'},
        {'uuid': self.uuid}
      ], function (err) {
        if (err)
          return callback(err);

        joolaio.viz.onscreen.push(self);

        joolaio.events.emit('pie.init.finish', self);
        if (typeof callback === 'function')
          return callback(null, self);
      });
    });
  }
  catch (err) {
    callback(err);
    return self.onError(err, callback);
  }

  //callback(null, self);
  return self;
};

if (typeof (jQuery) != 'undefined') {
  $.fn.Pie = function (options, callback) {
    var result = null;
    var uuid = this.attr('jio-uuid');
    if (!uuid) {
      //create new
      if (!options)
        options = {};
      options.container = this.get(0);
      result = new joolaio.viz.Pie(options, function (err, pie) {
        pie.draw(options, callback);
      }).options.$container;
    }
    else {
      //return existing
      var found = false;
      joolaio.viz.onscreen.forEach(function (viz) {
        if (viz.uuid == uuid && !found) {
          found = true;
          result = viz;
        }
      });
    }
    return result;
  };
}