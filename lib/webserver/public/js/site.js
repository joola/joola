var timeframe = 'last_hour';
var interval = 'minute';
var realtime = true;
var filter = [];
var userid = joola.common.uuid();

joola.events.on('ready', function () {
  var metric1Query = {
    timeframe: timeframe,
    interval: interval,
    filter: filter,
    dimensions: [],
    metrics: ['mousemoves'],
    collection: 'demo-mousemoves'
  };

  var metric2Query = {
    timeframe: timeframe,
    interval: interval,
    filter: filter,
    dimensions: [],
    metrics: ['visits'],
    collection: 'demo-visits'
  };

  var metric3Query = {
    timeframe: timeframe,
    interval: interval,
    filter: filter,
    dimensions: [],
    metrics: [
      {key: 'clicks'}
    ],
    collection: 'demo-clicks'
  };

  var chart1Query = {
    timeframe: 'last_minute',
    interval: 'second',
    dimensions: [
      {key: 'timestamp', collection: 'demo-mousemoves'}
    ],
    metrics: [
      {key: 'mousemoves', name: 'Mouse moves', collection: 'demo-mousemoves'}
    ]
  };

  setupMetricbox('#metricbox-1', 'Mouse Moves', metric1Query);
  setupMetricbox('#metricbox-2', 'Visits', metric2Query);
  setupMetricbox('#metricbox-3', 'Clicks', metric3Query);
  setupChart('#chart-1', chart1Query);

  function setupMetricbox(container, caption, query) {
    if (filter)
      query.filter = filter;
    query.realtime = realtime;
    $(container).Metric({force: true, caption: caption, query: query});
  }

  function setupChart(container, query) {
    var metric = $('.metric.active').Metric();
    console.log(metric);
    query.metrics = metric.options.query[0].metrics;
    query.collection = metric.options.query[0].collection;
    query.realtime = realtime;
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
    console.log(query);
  }

  $('.metric').on('click', function () {
    $('.metric').removeClass('active');
    $(this).addClass('active');

    setupChart('#chart-1', chart1Query);
  });
});

jQuery(document).ready(function () {
  prettyPrint();
});

$().ready(function () {
  try {
    var editor = ace.edit("editor");
    editor.getSession().setMode("ace/mode/javascript");
    editor.renderer.setShowGutter(false);

    var editor2 = ace.edit("editor2");
    editor2.getSession().setMode("ace/mode/javascript");
    editor2.renderer.setShowGutter(false);

    var editor3 = ace.edit("editor3");
    editor3.getSession().setMode("ace/mode/javascript");
    editor3.renderer.setShowGutter(false);
  }
  catch (ex) {

  }

  $('#pushEvent').on('click', function () {
    var collectionName = $('#collectionName').val();
    if (!collectionName)
      return alert('Please enter a collection name');

    var json = editor.getSession().getValue();
    try {
      json = JSON.parse(json);
      joola.beacon.insert(collectionName, json, function (err, result) {
        if (err)
          editor2.getSession().setValue(err);

        var text = JSON.stringify(result, null, 4);
        editor2.getSession().setValue(text);
      });
    }
    catch (ex) {
      console.log(ex);
      console.log(ex.stack);
      editor2.getSession().setValue(ex);
    }
  });

  $('#visualize').on('click', function () {
    var checked = $('.viz-check:checked').attr('data-attr');
    var collectionName = $('#viz-collectionName').val();
    if (!collectionName)
      return alert('Please enter a collection name');

    var json = editor3.getSession().getValue();
    var query = JSON.parse(json);
    query.collection = collectionName;
    var $container = $('#vizcontainer');

    switch (checked) {
      case 'timeline':
        $container.Timeline({force: true, query: query});
        break;
      case 'metricbox':
        query.dimensions = [];
        $container.Metric({force: true, query: query});
        break;
      case 'table':
        $container.Table({force: true, query: query});
        break;
      case 'pie':
        $container.Pie({force: true, query: query});
        break;
      default:
        break;
    }
  });

  $('.viz-check').on('click', function () {
    var $this = $(this);
    var checked = $this.attr('data-attr');
    $('.viz-check').each(function (i, elem) {
      var $elem = $(elem);
      if ($elem.attr('data-attr') !== checked)
        $elem.prop('checked', false);
    });
  });
});

$(document).on('click', '.dropdown-menu li', function (e) {
  e.stopPropagation();
});