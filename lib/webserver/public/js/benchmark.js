var timeframe = 'last_30_items';
var interval = 'day';
var realtime = true;
var filter = [];

joolaio.events.on('ready', function () {
  function getSeries() {
    var now = new Date().getTime();
    var
      data = [],
      totalPoints = 120;

    while (data.length < totalPoints) {
      var y = 0;
      var temp = {x: now -= updateInterval, y: y};

      data.unshift(temp);
    }

    return [
      {
        name: 'Bandwidth',
        data: data.slice(0),
        type: 'area',
        yAxis: 1
      },
      {
        name: 'API Calls',
        data: data.slice(0),
        type: 'line',
        yAxis: 0
      }
    ]
  }

// Set up the control widget
  var updateInterval = 1000;
  var plotOptions = {
    chart: {
      animation: false,
      height: 100,
      marginLeft: 0,
      spacingLeft: 0,
      marginRight: 0,
      spacingRight: 0
    },
    title: {
      text: null
    },
    credits: {
      enabled: false
    },
    xAxis: {
      type: 'datetime',
      labels: {
        enabled: false
      },
      tickLength: 0
    },
    yAxis: [
      {
        min: 0,
        title: {
          text: null
        },
        labels: {
          enabled: false,
          x: 25,
          y: -2
        },
        gridLineWidth: 0,
        maxPadding: 0.01
      },
      {
        min: 0,
        opposite: true,
        labels: {
          enabled: false,
          x: -25,
          y: -2,
          formatter: function () {
            return this.value + 'MB';
          }
        },
        title: {
          text: null
        },
        gridLineWidth: 0,
        maxPadding: 0.01
      }
    ],
    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      },
      area: {
        marker: {
          enabled: false
        }
      }
    },
    legend: {
      enabled: false
    },
    series: getSeries()
  };

  $("#usage").highcharts(plotOptions);

  function update() {
    var now = new Date().getTime();

    var rpcSinceLast = joolaio.usage.currentCalls;
    var rpcPoint = {x: now, y: rpcSinceLast};
    var bandwidthPoint = {x: now, y: bandwidthSinceLast};

    $('#counterEPSCurrent').text(rpcSinceLast);
    if (rpcPeak < rpcSinceLast)
      rpcPeak = rpcSinceLast;
    $('#counterEPSPeak').text(rpcPeak);
    if (rpcSinceLast > 0) {
      rpcSecondsUsed++;
    }
    if (rpcSinceLast)
      $('#counterEPSAvg').text(Math.round(rpcTotal / rpcSecondsUsed * 100) / 100);
    $('#counterEPSTotal').text(rpcTotal);

    $('#counterBPSCurrent').text((Math.round(bandwidthSinceLast / 1024 * 100) / 100) + 'MB');
    if (bandwidthPeak < bandwidthSinceLast)
      bandwidthPeak = bandwidthSinceLast;
    $('#counterBPSPeak').text((Math.round(bandwidthPeak / 1024 * 100) / 100) + 'MB');
    if (bandwidthSinceLast > 0) {
      bandwidthSecondsUsed++;
    }
    if (bandwidthSinceLast) {
      var value = Math.round(bandwidthTotal / bandwidthSecondsUsed * 100) / 100;
      value = (Math.round(value / 1024 * 100) / 100) + 'MB';
      $('#counterBPSAvg').text(value);
    }
    $('#counterBPSTotal').text((Math.round(bandwidthTotal / 1024 * 100) / 100) + 'MB');
    bandwidthSinceLast = 0;

    var chart = $("#usage").highcharts();
    chart.series[0].addPoint(bandwidthPoint, true, true, false);
    chart.series[1].addPoint(rpcPoint, false, true, false);

    setTimeout(update, updateInterval);
  }

  update();
});

var currentRPCCount = 0;
var totalBandwidth = 0;
var rpcSinceLast = 0;
var rpcTotal = 0;
var rpcPeak = 0;
var rpcSecondsUsed = 0;

var bandwidthSinceLast = 0;
var bandwidthPeak = 0;
var bandwidthTotal = 0;
var bandwidthSecondsUsed = 0;

var waitTime = 0;
var latencyTime = 0;

joolaio.events.on('bandwidth', function (usage) {
  totalBandwidth += usage / 1024;
  bandwidthSinceLast += usage / 1024;
  bandwidthTotal += usage / 1024;
});

joolaio.events.on('rpc:start', function (usage) {
  currentRPCCount++;
  rpcSinceLast++;
  rpcTotal++;
});

joolaio.events.on('rpc:done', function (usage) {
  currentRPCCount--;
});

joolaio.events.on('waittime', function (time) {
  waitTime += time;
});

joolaio.events.on('latency', function (time) {
  latencyTime += time;
});


var loadPeak = 0;
var loadMin;

var pushPeak = 0;
var pushMin;

var queryPeak = 0;
var queryMin = 0;

$('.btnStartLoad').on('click', function () {
  var counter = 0;
  var limit = 1000;
  var current = 0;
  var start = new Date().getTime();

  var progress = $(this).parent().parent().find('.percentage').progressbar({
    max: limit,
    value: current
  });

  while (counter < limit) {
    setTimeout(function () {
      joolaio.system.version(function () {
        current++;

        progress.progressbar('option', 'value', current);
        // progress.setProgress(current / limit );

        if (current === limit) {
          var end = new Date().getTime();
          var diff = end - start;
          var per = Math.round(diff / limit * 100) / 100;

          var loadLast = per;
          if (loadPeak < per)
            loadPeak = per;
          if (!loadMin)
            loadMin = per;
          if (loadMin > per)
            loadMin = per;

          $('#counterLoadLast').text((Math.round(diff / 1000 * 100) / 100) + 's (' + per + 'ms/call)');
          $('#counterLoadPeak').text(loadPeak + 'ms/call');
          $('#counterLoadMin').text(loadMin + 'ms/call');
        }
      });
    }, 0);
    counter++;
  }
});


$('.percentage').progressbar();

$('.btnStartPush').on('click', function () {
  var counter = 0;
  var limit = 1000;
  var current = 0;
  var start = new Date().getTime();

  var progress = $(this).parent().parent().find('.percentage').progressbar({
    max: limit,
    value: current
  });

  var doc = {
    "timestamp": null,
    "attribute": "attribute",
    "attribute2": "attribute",
    "attribute3": "attribute",
    "attribute4": "attribute",
    "attribute5": "attribute",
    "attribute6": "attribute",
    "attribute7": "attribute",
    "attribute8": "attribute",
    "value": 1234,
    "value2": 1234,
    "value3": 1234,
    "value4": 1234,
    "value5": 1234,
    "value6": 1234,
    "value7": 1234,
    "value8": 1234,
    "nested": {
      "nestedAttribute": "nestedAttribute",
      "nestedAttribute2": "nestedAttribute",
      "nestedAttribute3": "nestedAttribute",
      "nestedAttribute4": "nestedAttribute",
      "nestedAttribute5": "nestedAttribute",
      "nestedAttribute6": "nestedAttribute",
      "nestedAttribute7": "nestedAttribute",
      "nestedAttribute8": "nestedAttribute",
      "nestedValue": 5678,
      "nestedValue2": 5678,
      "nestedValue3": 5678,
      "nestedValue4": 5678,
      "nestedValue5": 5678,
      "nestedValue6": 5678,
      "nestedValue7": 5678,
      "nestedValue8": 5678
    }
  };

  while (counter < limit) {
    setTimeout(function () {

      joolaio.beacon.insert('benchmark', doc, {}, function () {
        current++;

        progress.progressbar('option', 'value', current);

        if (current === limit) {
          var end = new Date().getTime();
          var diff = end - start;
          var per = Math.round(diff / limit * 100) / 100;

          var pushLast = per;
          if (pushPeak < per)
            pushPeak = per;
          if (!pushMin)
            pushMin = per;
          if (pushMin > per)
            pushMin = per;

          $('#counterPushLast').text((Math.round(diff / 1000 * 100) / 100) + 's (' + per + 'ms/call)');
          $('#counterPushPeak').text(pushPeak + 'ms/call');
          $('#counterPushMin').text(pushMin + 'ms/call');
        }
      });
    }, 100);
    counter++;
  }
});


$('.btnStartQuery').on('click', function () {
  var counter = 0;
  var limit = 1000;
  var current = 0;
  var start = new Date().getTime();

  var progress = $(this).parent().parent().find('.percentage').progressbar({
    max: limit,
    value: current
  });

  var query = {
    timeframe: 'last_month',
    interval: 'day',
    dimensions: ['timestamp'],
    metrics: ['visits'],
    collection: 'demo-visits'
  };

  while (counter < limit) {
    setTimeout(function () {
      joolaio.query.fetch(query, function () {
        current++;

        progress.progressbar('option', 'value', current);
        // progress.setProgress(current / limit );

        if (current === limit) {
          var end = new Date().getTime();
          var diff = end - start;
          var per = Math.round(diff / limit * 100) / 100;

          var queryLast = per;
          if (queryPeak < per)
            queryPeak = per;
          if (!queryMin)
            queryMin = per;
          if (queryMin > per)
            queryMin = per;

          $('#counterQueryLast').text((Math.round(diff / 1000 * 100) / 100) + 's (' + per + 'ms/call)');
          $('#counterQueryPeak').text(queryPeak + 'ms/call');
          $('#counterQueryMin').text(queryMin + 'ms/call');
        }
      });
    }, 0);
    counter++;
  }
});