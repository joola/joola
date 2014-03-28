var timeframe = 'last_hour';
var interval = 'second';
var realtime = true;
var filter = [];
var userid = joolaio.common.uuid();

joolaio.events.on('ready', function () {
  joolaio.beacon.insert('demo-visits', {
    timestamp: null,
    browser: $.ua.browser.name,
    device: $.ua.device.name,
    engine: $.ua.engine.name,
    os: $.ua.os.name,
    userid: userid,
    ip: codehelper_ip.IP,
    referrer: document.referrer,
    visits: 1,
    loadtime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
  }, {});

  $(document).click(function (event) {
    joolaio.beacon.insert('demo-clicks', {
      timestamp: null,
      browser: $.ua.browser.name,
      device: $.ua.device.name,
      engine: $.ua.engine.name,
      os: $.ua.os.name,
      userid: userid,
      ip: codehelper_ip.IP,
      referrer: document.referrer,
      clicks: 1
    }, {});
  });

  var iTimeoutMoves = 0;
  var moves = [];
  $(document).mousemove(function (event) {
    function pushMoves() {
      joolaio.beacon.insert('demo-mousemoves', moves, {});
      moves = [];
    }

    clearTimeout(iTimeoutMoves);
    var doc = {
      timestamp: null,
      browser: $.ua.browser.name,
      device: $.ua.device.name,
      engine: $.ua.engine.name,
      os: $.ua.os.name,
      userid: userid,
      ip: codehelper_ip.IP,
      referrer: document.referrer,
      mousemoves: 1
    };
    moves.push(doc);
    if (moves.length > 100)
      pushMoves();
    iTimeoutMoves = setTimeout(pushMoves, 10);
  });
});

joolaio.events.on('ready', function () {
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

  $('.metric').on('click', function () {
    $('.metric').removeClass('active');
    $(this).addClass('active');

    setupChart('#chart-1', chart1Query);
  });
});


jQuery(document).ready(function () {
  prettyPrint();
});