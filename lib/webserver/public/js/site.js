var timeframe = 'last_hour';
var interval = 'minute';
var realtime = true;
var filter = [];
var userid = joolaio.common.uuid();


joolaio.events.on('ready', function () {
  try {
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
      loadtime: (window.performance && window.performance.timing ? window.performance.timing.loadEventEnd - window.performance.timing.navigationStart : null)
    }, {});

    $(document).click(function (event) {
      try {
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
      }
      catch (ex) {
        $('#log').append('<div>' + ex + '</div>');
        console.log(ex);
      }
    });

    var iTimeoutMoves = 0;
    var moves = 0;
    $(document).mousemove(function (event) {
      try {
        function pushMoves() {
          if (moves > 0) {
            var doc = {
              timestamp: null,
              browser: $.ua.browser.name,
              device: $.ua.device.name,
              engine: $.ua.engine.name,
              os: $.ua.os.name,
              userid: userid,
              ip: codehelper_ip.IP,
              referrer: document.referrer,
              mousemoves: moves
            };
            joolaio.beacon.insert('demo-mousemoves', doc, {});
            moves = 0;
          }
        }

        clearTimeout(iTimeoutMoves);

        moves++;
        if (moves > 100)
          pushMoves();
        iTimeoutMoves = setTimeout(pushMoves, 100);
      }
      catch (ex) {
        $('#log').append('<div>' + ex + '</div>');
        console.log(ex);
      }
    });
  }
  catch (ex) {
    $('#log').append('<div>' + ex + '</div>');
    console.log(ex);
  }
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
    timeframe: 'last_hour',
    interval: 'minute',
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

$(document).on('click', '.dropdown-menu li', function (e) {
  e.stopPropagation();
});