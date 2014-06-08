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
        //enabled: false,
        title: {
          text: null
        },
        labels: {
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

    var rpcPoint = {x: now, y: rpcSinceLast};
    var bandwidthPoint = {x: now, y: bandwidthSinceLast};

    rpcSinceLast = 0;
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
var bandwidthSinceLast = 0;
var waitTime = 0;
var latencyTime = 0;

joolaio.events.on('bandwidth', function (usage) {
  totalBandwidth += usage / 1024;
  bandwidthSinceLast += usage / 1024;
});

joolaio.events.on('rpc:start', function (usage) {
  currentRPCCount++;
  rpcSinceLast++;
});

joolaio.events.on('rpc:done', function (usage) {
  currentRPCCount--;
});

joolaio.events.on('waittime', function (time) {
  waitTime += time;
  console.log('time', time);
});

joolaio.events.on('latency', function (time) {
  latencyTime += time;
  console.log('latency', time);
});

$('.btnStart').on('click', function () {
  var counter = 0;
  var limit = 10000;
  while (counter < limit) {
    setTimeout(function () {
      joolaio.system.version(function () {
      });
    }, 0);
    counter++;
  }
});