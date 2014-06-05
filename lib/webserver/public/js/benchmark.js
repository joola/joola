var timeframe = 'last_30_items';
var interval = 'day';
var realtime = true;
var filter = [];

joolaio.events.on('ready', function () {
  var
    rpcData = [],
    bandWidthData = [],
    totalPoints = 1000;

  function getSeries() {
    var now = new Date().getTime();
    if (rpcData.length > totalPoints)
      rpcData.shift();
    if (bandWidthData.length > totalPoints)
      bandWidthData.shift();

    rpcData.push([now, rpcSinceLast]);
    rpcSinceLast = 0;
    bandWidthData.push([now, totalBandwidth]);

    while (rpcData.length < totalPoints) {
      var y = 0;
      var temp = [now -= updateInterval, y]; //data format [x, y]

      rpcData.unshift(temp);
      bandWidthData.unshift(temp);
    }

    var rpcSeries = [];
    for (var i = 0; i < rpcData.length; ++i) {
      rpcSeries.push(rpcData[i]);
    }

    var bandwidthSeries = [];
    for (var i = 0; i < bandWidthData.length; ++i) {
      bandwidthSeries.push(bandWidthData[i]);
    }

    return [
      {
        label: 'Bandwidth',
        data: bandWidthData,
        lines: {
          show: true,
          fill: true
        },
        points: {
          show: false,
          fillColor: '#4572A7'
        },
        color: '#4572A7',
        yaxis: 2
      },
      {
        label: 'API Calls',
        data: rpcSeries,
        lines: {
          show: true,
          fill: false
        },
        points: {
          show: false,
          fillColor: '#4572A7'
        },
        color: "#478514",
        yaxis: 1
      }
    ]
  }

// Set up the control widget

  var updateInterval = 100;
  var plotOptions = {
    xaxis: {
      mode: "time",
      axisLabel: "Time"
    },
    yaxes: [
      {
        min: 0,
        alignTicksWithAxis: 1,
        position: 0,
        axisLabel: "Bandwidth",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
        axisLabelPadding: 5
      },
      {
        min: 0,
        axisLabel: "Pending calls",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
        axisLabelPadding: 5
      }

    ],
    grid: {
      hoverable: false,
      borderWidth: 1
    },
    legend: {
      labelBoxBorderColor: "none",
      position: "sw"
    }
  };
  var plot = $.plot("#usage", getSeries(), plotOptions);

  function update() {
    plot.setData(getSeries());
    // Since the axes don't change, we don't need to call plot.setupGrid()
    plot.setupGrid();
    plot.draw();
    setTimeout(update, updateInterval);
  }


  function getMonthName(numericMonth) {
    var monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var alphaMonth = monthArray[numericMonth];

    return alphaMonth;
  }

  function convertToDate(timestamp) {
    var newDate = new Date(timestamp);
    var dateString = newDate.getMonth();
    var monthName = getMonthName(dateString);

    return monthName;
  }

  var previousPoint = null;
  var previousPointLabel = null;

  $("#usage").bind("plothover", function (event, pos, item) {
    if (item) {
      if ((previousPoint != item.dataIndex) || (previousLabel != item.series.label)) {
        previousPoint = item.dataIndex;
        previousLabel = item.series.label;

        $("#flot-tooltip").remove();

        if (item.series.label == "Bandwidth") {
          var unitLabel = "bytes";
        }

        var x = new Date(item.datapoint[0]).toISOString();
        y = item.datapoint[1];
        z = item.series.color;

        showTooltip(item.pageX, item.pageY,
          "<b>" + item.series.label + "</b><br /> " + x + " = " + y + (unitLabel ? unitLabel : ''),
          z);
      }
    } else {
      $("#flot-tooltip").remove();
      previousPoint = null;
    }
  });

  update();
})
;


var currentRPCCount = 0;
var totalBandwidth = 0;
var rpcSinceLast = 0;

joolaio.events.on('bandwidth', function (usage) {
  totalBandwidth += usage / 1024;
});

joolaio.events.on('rpc:start', function (usage) {
  currentRPCCount++;
  rpcSinceLast++;
});

joolaio.events.on('rpc:done', function (usage) {
  currentRPCCount--;
});

function showTooltip(x, y, contents, z) {
  $('<div id="flot-tooltip">' + contents + '</div>').css({
    position: 'absolute',
    display: 'none',
    top: y - 30,
    left: x + 30,
    border: '2px solid',
    padding: '2px',
    'background-color': '#FFF',
    opacity: 0.80,
    'border-color': z,
    '-moz-border-radius': '5px',
    '-webkit-border-radius': '5px',
    '-khtml-border-radius': '5px',
    'border-radius': '5px'
  }).appendTo("body").fadeIn(200);
}


$('.btnStart').on('click', function () {
  var counter = 0;
  var limit = 10000;
  while (counter < limit) {
    setTimeout(function () {
      joolaio.collections.list(function () {
      });
    }, 0);
    counter++;
  }
});