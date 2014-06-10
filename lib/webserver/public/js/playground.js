var timeframe = 'last_hour';
var interval = 'minute';
var realtime = true;
var filter = [];
var userid = joolaio.common.uuid();

joolaio.events.on('ready', function () {
  /*
   $(function () {
   $(".sortable").sortable({
   start: function () {
   $('.dimensionpickers').show();
   },
   stop: function () {
   $('.dimensionpickers').hide();
   },
   placeholder: "ui-state-highlight"
   });
   $(".sortable").disableSelection();
   });*/

  build(function (err) {
    if (err)
      throw err;
  });
});

var dlasttarget = null;
var mlasttarget = null;
function build(callback) {
  function checkDimensionPickers() {
    var length = $('.dimensionpicker').length;
    if (length <= 0)
      addDimensionPicker(length);
    else {
      var lengthActive = $('.dimensionpicker.active').length;
      if (lengthActive >= length)
        addDimensionPicker(length + 1);
    }
  }

  function addDimensionPicker(index) {
    var $picker = $('<div id="dplaceholder-' + index + '" class="dimensionpicker">+ add dimension</div>');
    $('.dimensionpickers').append($picker);
  }


  function checkMetricPickers() {
    var length = $('.metricpicker').length;
    if (length <= 0)
      addMetricPicker(length);
    else {
      var lengthActive = $('.metricpicker.active').length;
      if (lengthActive >= length)
        addMetricPicker(length + 1);
    }
  }

  function addMetricPicker(index) {
    var $picker = $('<div id="mplaceholder-' + index + '" class="metricpicker">+ add metric</div>');
    $('.metricpickers').append($picker);
  }

  var $dimensionsPopup = $('.dimensionsPopup');
  var $metricsPopup = $('.metricsPopup');
  joolaio.collections.list(function (err, collections) {
    if (err)
      return callback(err);

    collections.forEach(function (collection) {
      var $ul = $('<ul class="collectionOption"><b class="caret"></b> ' + collection.name + '</ul>');
      $metricsPopup.append($ul);
      collection.metrics.forEach(function (metric) {
        var $li = $('<li class="metricOption" data-member="' + collection.key + '.' + metric.key + '">' + metric.name + '</li>');
        $li.off('click');
        $li.on('click', function (e) {
          e.stopPropagation();
          var $placeholder = $('#' + $metricsPopup.attr('data-target'));
          $placeholder.attr('data-selected', collection.key + '.' + metric.key);

          var $content = metric.name + ' <button type="button" class="close">&times;</button> <button type="button" class="cog glyphicon glyphicon-cog"></button>';

          var config = {
            key: collection.key + '.' + metric.key,
            name: metric.name,
            aggregation: 'SUM',
            prefix: metric.prefix || '',
            suffix: metric.suffix || ''
          };

          Object.keys(config).forEach(function (key) {
            $placeholder.data(key, config[key]);
          });

          $placeholder.html($content);
          $placeholder.find('button.close').off('click');
          $placeholder.find('button.close').on('click', function () {
            e.stopPropagation();
            $placeholder.remove();
            mSkipOne = true;
            checkMetricPickers();
            joolaio.events.emit('playgroundRedraw');
          });
          $placeholder.find('button.cog').off('click');
          $placeholder.find('button.cog').on('click', function () {
            e.stopPropagation();
            var options = {};
            $('#metricModal').attr('data-target', collection.key + '.' + metric.key);
            $('#metricModal').modal(options);
            mSkipOne = true;
          });
          $placeholder.addClass('active');
          $('.metricsPopup').removeClass('active');
          mOpen = false;
          mlasttarget = null;

          checkMetricPickers();
          joolaio.events.emit('playgroundRedraw');
        });
        $ul.append($li);
      });
      $ul.off('click');
      $ul.on('click', function (e) {
        e.stopPropagation();
        $ul.toggleClass('active');
      });

      var $dul = $('<ul class="collectionOption"><b class="caret"></b> ' + collection.name + '</ul>');
      $dimensionsPopup.append($dul);
      collection.dimensions.forEach(function (dimension) {
        var $li = $('<li class="dimensionOption" data-member="' + collection.key + '.' + dimension.key + '">' + dimension.name + '</li>');
        $li.off('click');
        $li.on('click', function (e) {
          e.stopPropagation();
          var $placeholder = $('#' + $dimensionsPopup.attr('data-target'));
          $placeholder.attr('data-selected', collection.key + '.' + dimension.key);
          var config = {
            key: collection.key + '.' + dimension.key,
            name: dimension.name
          };

          Object.keys(config).forEach(function (key) {
            $placeholder.data(key, config[key]);
          });
          var $content = '<button type="button" class="cog glyphicon glyphicon-cog"></button> ' + dimension.name + ' <button type="button" class="close">&times;</button>';
          $placeholder.html($content);
          $placeholder.find('button.close').off('click');
          $placeholder.find('button.close').on('click', function () {
            e.stopPropagation();
            $placeholder.remove();
            dSkipOne = true;
            checkDimensionPickers();
            joolaio.events.emit('playgroundRedraw');
          });
          $placeholder.find('button.cog').off('click');
          $placeholder.find('button.cog').on('click', function () {
            e.stopPropagation();
            var options = {};
            $('#dimensionModal').attr('data-target', collection.key + '.' + dimension.key);
            $('#dimensionModal').modal(options);
            dSkipOne = true;
          });
          $placeholder.addClass('active');
          $('.dimensionsPopup').removeClass('active');
          dOpen = false;
          dlasttarget = null;

          checkDimensionPickers();
          joolaio.events.emit('playgroundRedraw');
        });
        $dul.append($li);
      });
      $dul.off('click');
      $dul.on('click', function (e) {
        e.stopPropagation();
        $dul.toggleClass('active');
      });
    });
  });

  var dOpen = false;
  var dSkipOne = false;
  $(document).off('click', '.dimensionpicker');
  $(document).on('click', '.dimensionpicker', function (e) {
    var $this = $(this);
    e.stopPropagation();
    if (dOpen && dlasttarget == this.id) {
      $('.dimensionsPopup').removeClass('active');
      dlasttarget = null;
      dOpen = false;
    }
    else if (dSkipOne) {
      $('.dimensionsPopup').removeClass('active');
      dlasttarget = null;
      dOpen = false;
      dSkipOne = false;
    }
    else {
      $('.dimensionsPopup').addClass('active');
      dlasttarget = this.id;
      dOpen = true;
    }
    var offset = $this.offset();
    $('.dimensionsPopup').css('top', offset.top + $(this).outerHeight() - 1);
    $('.dimensionsPopup').css('left', offset.left);
    $('.dimensionsPopup').find('ul.active').removeClass('active');

    $('.dimensionsPopup').attr('data-target', this.id);

    //set selected
    $dimensionsPopup.find('li').removeClass('active');
    if ($this.attr('data-selected') && $this.attr('data-selected').length > 0) {
      var $li = $($dimensionsPopup.find('li[data-member="' + $this.attr('data-selected') + '"]')[0]);
      $li.addClass('active');
      $li.parent().addClass('active');
    }
  });

  var mOpen = false;
  var mSkipOne = false;
  $(document).off('click', '.metricpicker');
  $(document).on('click', '.metricpicker', function (e) {
    var $this = $(this);
    e.stopPropagation();
    if (mOpen && mlasttarget == this.id) {
      $('.metricsPopup').removeClass('active');
      mlasttarget = null;
      mOpen = false;
    }
    else if (mSkipOne) {
      $('.metricsPopup').removeClass('active');
      mlasttarget = null;
      mOpen = false;
      mSkipOne = false;
    }
    else {
      $('.metricsPopup').addClass('active');
      mlasttarget = this.id;
      mOpen = true;
    }
    var offset = $this.offset();
    $('.metricsPopup').css('top', offset.top + $(this).outerHeight() - 1);
    $('.metricsPopup').css('left', offset.left);
    $('.metricsPopup').find('ul.active').removeClass('active');

    $('.metricsPopup').attr('data-target', this.id);

    //set selected
    $metricsPopup.find('li').removeClass('active');
    if ($this.attr('data-selected') && $this.attr('data-selected').length > 0) {
      var $li = $($metricsPopup.find('li[data-member="' + $this.attr('data-selected') + '"]')[0]);
      $li.addClass('active');
      $li.parent().addClass('active');
    }
  });

  $('.dimensionsPopup').off('click');
  $('.dimensionsPopup').on('click', function (e) {
    e.stopPropagation();
  });

  $('.metricsPopup').off('click');
  $('.metricsPopup').on('click', function (e) {
    e.stopPropagation();
  });

  checkDimensionPickers();
  checkMetricPickers();

  $('body').on('click', function () {
    $('.dimensionsPopup').removeClass('active');
    $('.metricsPopup').removeClass('active');
  });

  $('#dimensionModal').off('show.bs.modal');
  $('#dimensionModal').on('show.bs.modal', function (e) {
    var $this = $(this);
    var $target = $('.dimensionpicker[data-selected="' + $this.attr('data-target') + '"]');

    $this.find('#inputKey').val($target.data('key'));
    $this.find('#inputDisplayName').val($target.data('name'));
  });

  $('#dimensionModal .btnSubmit').off('click');
  $('#dimensionModal .btnSubmit').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $this = $('#dimensionModal');
    var $target = $('.dimensionpicker[data-selected="' + $this.attr('data-target') + '"]');

    $target.data('key', $this.find('#inputKey').val());
    $target.data('name', $this.find('#inputDisplayName').val());

    $this.modal('hide');
    joolaio.events.emit('playgroundRedraw');
  });

  $('#metricModal').off('show.bs.modal');
  $('#metricModal').on('show.bs.modal', function (e) {
    var $this = $(this);
    var $target = $('.metricpicker[data-selected="' + $this.attr('data-target') + '"]');

    $this.find('#inputKey').val($target.data('key'));
    $this.find('#inputDisplayName').val($target.data('name'));
    $this.find('#inputPrefix').val($target.data('prefix'));
    $this.find('#inputSuffix').val($target.data('suffix'));
    $this.find('#inputAggregation').val($target.data('aggregation').toUpperCase());
  });

  $('#metricModal .btnSubmit').off('click');
  $('#metricModal .btnSubmit').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $this = $('#metricModal');
    var $target = $('.metricpicker[data-selected="' + $this.attr('data-target') + '"]');

    $target.data('key', $this.find('#inputKey').val());
    $target.data('name', $this.find('#inputDisplayName').val());
    $target.data('prefix', $this.find('#inputPrefix').val() || '');
    $target.data('suffix', $this.find('#inputSuffix').val() || '');
    $target.data('aggregation', $this.find('#inputAggregation').val());

    $this.modal('hide');
    joolaio.events.emit('playgroundRedraw');
  });
}

function populate(collectionKey, callback) {
  joolaio.collections.get(collectionKey, function (err, collection) {
    if (err)
      return callback(err);

    var $dimensionsContainer = $('#dimensionsList');
    $dimensionsContainer.empty();
    collection.dimensions.forEach(function (dimension) {
      var $item = $('<div class="dimensionpicker">' + dimension.name + '</div>');
      $item.off('click');
      $item.on('click', function () {
        var $this = $(this);
        $this.toggleClass('active');
      });
      $dimensionsContainer.append($item);
    });

    var $metricsContainer = $('#metricsList');
    $metricsContainer.empty();
    collection.metrics.forEach(function (metric) {
      var $item = $('<div class="metricpicker">' + metric.name + '</div>');
      $item.off('click');
      $item.on('click', function () {
        var $this = $(this);
        $this.toggleClass('active');
      });
      $metricsContainer.append($item);
    });
  });
}

joolaio.events.on('playgroundRedraw', function () {
  var dCount = 0;
  var mCount = 0;

  var dimensions = [];
  var metrics = [];

  $('.dimensionpicker.active').each(function (i, elem) {
    var $elem = $(elem);
    var config = $elem.data();

    dimensions.push(config);

    dCount++;
  });

  $('.metricpicker.active').each(function (i, elem) {
    var $elem = $(elem);
    var config = $elem.data();

    metrics.push(config);

    mCount++;
  });

  if (mCount === 0 || dCount === 0) {
    $('.row.issue').show();
    $('.visualization').hide();

    return;
  }

  $('.row.issue').hide();
  $('.visualization').show();

  $('.metricsRow').empty();
  var query = {
    timeframe: timeframe,
    interval: interval,
    filter: filter,
    dimensions: [],
    metrics: []
  };

  metrics.forEach(function (metric, i) {
    var $elem = $('<div id="metricbox-' + (i + 1).toString() + '" class="metric"></div>');
    $('.metricsRow').append($elem);
    var _query = joolaio.common.extend({}, query);
    var _metric = joolaio.common.extend({}, metric);
    if (!_metric.collection) {
      _metric.collection = _metric.key.split('.')[0];
      _metric.key = _metric.key.split('.')[1];
    }
    _metric.aggregation = _metric.aggregation.toLowerCase();
    _query.metrics.push(_metric);

    $elem.Metric({force: true, caption: metric.name, query: _query}, function () {
      if (i === 0)
        $elem.click();
    });
  });

  function setupChart(container, query) {
    var metric = $('.metric.active').Metric();
    $(container).Timeline({force: true,
      chart: {
        chart: {
          type: 'column'
        },
        plotOptions: {
          column: {
            color: 'rgba(87,173,104,0.8)',
            pointWidth: 15
          }
        }
      },
      query: query});
  }

  function setupTable(container, query) {
    var metric = $('.metric.active').Metric();
    $(container).Table({force: true,
      query: query});
  }

  $(document).off('click', '.metric');
  $(document).on('click', '.metric', function () {
    $('.metric').removeClass('active');
    $(this).addClass('active');

    var selectedMetric = $('.metric.active').Metric().options.query.metrics[0];
    var chartQuery = {
      timeframe: timeframe,
      interval: interval,
      filter: filter,
      dimensions: [
        {key: 'timestamp', collection: selectedMetric.collection}
      ],
      metrics: [selectedMetric]
    };

    setupChart('#chart-1', chartQuery);
    var tableQuery = {
      timeframe: timeframe,
      interval: interval,
      filter: filter,
      dimensions: [],
      metrics: []
    };

    dimensions.forEach(function (d) {
      if (!d.collection)
        d.collection = d.key.split('.')[0];
      if (d.key.indexOf('.') > -1)
        d.key = d.key.split('.')[1];
      tableQuery.dimensions.push(d);
    });

    metrics.forEach(function (m) {
      if (!m.collection)
        m.collection = m.key.split('.')[0];
      if (m.key.indexOf('.') > -1)
        m.key = m.key.split('.')[1];

      tableQuery.metrics.push(m);
    });

    setupTable('#table-1', tableQuery);
  });
});
