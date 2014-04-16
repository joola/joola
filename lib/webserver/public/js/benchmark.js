var timeframe = 'last_30_days';
var interval = 'day';
var realtime = true;
var filter = [];

joolaio.events.on('ready', function () {
  var metric1Query = {
    timeframe: timeframe,
    interval: interval,
    filter: filter,
    dimensions: [],
    metrics: [
      {
        key: 'bench-count',
        aggregation: 'count',
        dependsOn: 'benchmarkID'
      }
    ],
    collection: 'benchmark'
  };

  var metric2Query = {
    timeframe: timeframe,
    interval: interval,
    filter: filter,
    dimensions: [],
    metrics: [
      {
        key: 'flow-count',
        aggregation: 'sum',
        dependsOn: 'flowCount'
      }
    ],
    collection: 'benchmark'
  };

  var metric3Query = {
    timeframe: timeframe,
    interval: interval,
    filter: filter,
    dimensions: [],
    metrics: [
      {
        key: 'Test-count',
        aggregation: 'sum',
        dependsOn: 'flows.main.meter.count'
      }
    ],
    collection: 'benchmark'
  };

  var metric4Query = {
    timeframe: timeframe,
    interval: interval,
    filter: filter,
    dimensions: [],
    metrics: [
      {
        key: 'reqrate',
        name: 'Avg. Request Time',
        formula: {
          dependsOn: [
            {
              key: 'req-count',
              aggregation: 'avg',
              dependsOn: 'flows.main.meter.count'
            },
            {
              key: 'elapsed',
              aggregation: 'avg',
              dependsOn: 'flows.totalElapsed'
            }
          ],
          run: 'function(count, elapsed){return elapsed/count}'
        },
        decimals: 2,
        suffix: 'ms'
      }
    ],
    collection: 'benchmark'
  };

  var chart1Query = {
    timeframe: timeframe,
    interval: interval,
    dimensions: [
      {key: 'timestamp'}
    ],
    metrics: [
      {
        key: 'reqrate',
        name: 'Avg. Request Time',
        formula: {
          dependsOn: [
            {
              key: 'req-count',
              aggregation: 'avg',
              dependsOn: 'flows.main.meter.count'
            },
            {
              key: 'elapsed',
              aggregation: 'avg',
              dependsOn: 'flows.totalElapsed'
            }
          ],
          run: 'function(count, elapsed){return elapsed/count}'
        },
        decimals: 2,
        suffix: 'ms'
      }
    ],
    collection: 'benchmark'
  };

  var table1Query = {
    timeframe: timeframe,
    interval: interval,
    dimensions: [
      {key: 'flows.name', name: 'Flow name', collection: 'benchmark'}
    ],
    metrics: [
      {
        key: 'reqrate',
        name: 'Avg. Request Time',
        formula: {
          dependsOn: [
            {
              key: 'req-count',
              aggregation: 'avg',
              dependsOn: 'flows.main.meter.count'
            },
            {
              key: 'elapsed',
              aggregation: 'avg',
              dependsOn: 'flows.totalElapsed'
            }
          ],
          run: 'function(count, elapsed){return elapsed/count}'
        },
        decimals: 4,
        suffix: 'ms'
      }
    ],
    collection: 'benchmark'
  };

  setupMetricbox('#metricbox-1', 'Benchmark Tests', metric1Query);
  setupMetricbox('#metricbox-2', 'Flow Executions', metric2Query);
  setupMetricbox('#metricbox-3', 'Test Count', metric3Query);
  setupMetricbox('#metricbox-4', 'Avg. Request time', metric4Query);
  setupChart('#chart-1', chart1Query);
  setupTable('#table-1', table1Query);

  function setupMetricbox(container, caption, query) {
    if (filter)
      query.filter = filter;
    query.realtime = realtime;
    $(container).Metric({force: true, caption: caption, query: query});
  }

  function setupChart(container, query) {
    var metric = $('.metric.active').Metric();
    query.metrics = metric.options.query.metrics;
    query.collection = metric.options.query.collection;
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
  }

  function setupTable(container, query) {
    if (filter)
      query.filter = filter;
    query.realtime = realtime;
    $(container).Table({force: true, query: query});
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
  var editor = ace.edit("editor");
  editor.getSession().setMode("ace/mode/javascript");
  editor.renderer.setShowGutter(false);

  var editor2 = ace.edit("editor2");
  editor2.getSession().setMode("ace/mode/javascript");
  editor2.renderer.setShowGutter(false);

  var editor3 = ace.edit("editor3");
  editor3.getSession().setMode("ace/mode/javascript");
  editor3.renderer.setShowGutter(false);


  $('#pushEvent').on('click', function () {
    var collectionName = $('#collectionName').val();
    if (!collectionName)
      return alert('Please enter a collection name');

    var json = editor.getSession().getValue();
    try {
      json = JSON.parse(json);
      joolaio.beacon.insert(collectionName, json, function (err, result) {
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
      case 'sparkline':
        $container.Sparkline({force: true, query: query});
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
