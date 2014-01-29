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


var MiniTable = module.exports = function (options, callback) {
  if (!callback)
    callback = function () {
    };
  joolaio.events.emit('minitable.init.start');

  //mixin
  this._super = {};
  for (var x in require('./_proto')) {
    this[x] = require('./_proto')[x];
    this._super[x] = require('./_proto')[x];
  }

  var self = this;

  this._id = '_minitable';
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

  this.template = function () {
    var $html = $('<table class="jio minitable table">' +
      '<thead>' +
      '</thead>' +
      '<tbody>' +
      '</tbody>' +
      '</table>');
    return $html;
  };

  this.sort = function (key, callback) {
    if (typeof callback === 'function')
      return callback(null);
  };

  this._draw = function (callback) {
    if (typeof callback === 'function')
      return callback(null);
  };

  this.draw = function (options, callback) {
    return this._super.fetch(this.options.query, function (err, message) {
      if (err) {
        if (typeof callback === 'function')
          return callback(err);
        else
          throw err;
        return;
      }

      var series = self._super.makeTableChartSeries(message.dimensions, message.metrics, message.documents);
      if (!self.drawn) {
        self.drawn = true;

        var $html = self.template();

        var $thead = $($html.find('thead'));
        var $head_tr = $('<tr class="jio minitable captions"></tr>');

        message.dimensions.forEach(function (d) {
          var $th = $('<th class="jio minitable caption dimension"></th>');
          $th.text(d.name);
          $head_tr.append($th);
        });
        message.metrics.forEach(function (m) {
          var $th = $('<th class="jio minitable caption metric"></th>');
          $th.text(m.name);
          $head_tr.append($th);
        });

        $thead.append($head_tr);
        $html.append($thead);

        var $tbody = $($html.find('tbody'));
        series.forEach(function (ser, serIndex) {
          ser.data.forEach(function (point) {
            var $tr = $('<tr></tr>');

            var index = 0;
            message.dimensions.forEach(function (d) {
              var $td = $('<td class="jio minitable value dimension"></td>');
              $td.text(point[index++]);
              $tr.append($td);
            });
            message.metrics.forEach(function (m) {
              var $td = $('<td class="jio minitable value metric"></td>');
              $td.text(point[index++]);
              $tr.append($td);
            });

            $tbody.append($tr)
          });
        });
        $html.append($tbody);
        self.options.$container.append($html);
        sorttable.makeSortable($html.get(0));

        var sortth = self.options.$container.find('th')[message.dimensions.length];
        sorttable.innerSortFunction.apply(sortth, []);
        sorttable.innerSortFunction.apply(sortth, []);

        if (typeof callback === 'function')
          return callback(null);
      }
      else if (self.options.query.realtime) {
        console.log('test2');
        //we're dealing with realtime
        var trs = self.options.$container.find('tbody').find('tr');
        var existingkeys = [];
        series[0].data.forEach(function (point) {
          var index = 0;
          var key = '';
          var found = false;
          message.dimensions.forEach(function (d) {
            key += point[index++];
          });

          existingkeys.push(key);

          for (var i = 0; i < trs.length; i++) {
            var $tr = $(trs[i]);
            var cols = $tr.find('td');

            var _key = '';
            var j;
            for (j = 0; j < message.dimensions.length; j++) {
              var $col = $(cols[j]);
              _key += $col.text();
            }

            if (_key == key) {
              for (; j < message.dimensions.length + message.metrics.length; j++) {
                var $col = $(cols[j]);
                var value = $col.text();
                if (value != point[j])
                  $col.text(point[j]);
              }
              found = true;
            }
          }
          if (!found) {
            //add
            var $tbody = $(self.options.$container.find('tbody')[0]);
            var $tr = $('<tr></tr>');

            var index = 0;
            message.dimensions.forEach(function (d) {
              var $td = $('<td class="jio minitable value dimension"></td>');
              $td.text(point[index++]);
              $tr.append($td);
            });
            message.metrics.forEach(function (m) {
              var $td = $('<td class="jio minitable value metric"></td>');
              $td.text(point[index++]);
              $tr.append($td);
            });

            $tbody.append($tr)
          }
        });
        console.log('test');
        console.log(trs);
        for (var i = 0; i < trs.length; i++) {
          var $tr = $(trs[i]);
          var cols = $tr.find('td');

          var _key = '';
          var j;
          for (j = 0; j < message.dimensions.length; j++) {
            var $col = $(cols[j]);
            _key += $col.text();
          }

          console.log(_key, existingkeys, existingkeys.indexOf(_key));
          if (existingkeys.indexOf(_key) == -1)
            $tr.remove();
        }

        var sortth = self.options.$container.find('th.sorttable_sorted').get(0);
        if (!sortth)
          sortth = self.options.$container.find('th.sorttable_sorted_reverse').get(0);
        if (!sortth)
          sortth = self.options.$container.find('th')[1];

        if ($(sortth).hasClass('sorttable_sorted')) {
          $(sortth).removeClass('sorttable_sorted');
          sorttable.innerSortFunction.apply(sortth, []);
        }
        else if ($(sortth).hasClass('sorttable_sorted_reverse')) {
          $(sortth).removeClass('sorttable_sorted_reverse');
          sorttable.innerSortFunction.apply(sortth, []);
          sorttable.innerSortFunction.apply(sortth, []);
        }
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
        {'type': 'minitable'},
        {'uuid': self.uuid}
      ], function (err) {
        if (err)
          return callback(err);

        joolaio.viz.onscreen.push(self);

        joolaio.events.emit('minitable.init.finish', self);
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
  $.fn.MiniTable = function (options, callback) {
    var result = null;
    var uuid = this.attr('jio-uuid');
    if (!uuid) {
      //create new
      if (!options)
        options = {};
      options.container = this.get(0);
      result = new joolaio.viz.MiniTable(options, function (err, minitable) {
        minitable.draw(options, callback);
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