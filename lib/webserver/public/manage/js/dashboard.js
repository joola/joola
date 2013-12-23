// First Chart Example - Area Line Chart

/*
 Morris.Area({
 // ID of the element in which to draw the chart.
 element: 'dashboard-chart',
 // Chart data records -- each entry in this array corresponds to a point on
 // the chart.
 data: [
 { d: '2012-10-01', visits: 802 },
 { d: '2012-10-02', visits: 783 },
 { d: '2012-10-03', visits: 820 },
 { d: '2012-10-04', visits: 839 },
 { d: '2012-10-05', visits: 792 },
 { d: '2012-10-06', visits: 859 },
 { d: '2012-10-07', visits: 790 },
 { d: '2012-10-08', visits: 1680 },
 { d: '2012-10-09', visits: 1592 },
 { d: '2012-10-10', visits: 1420 },
 { d: '2012-10-11', visits: 882 },
 { d: '2012-10-12', visits: 889 },
 { d: '2012-10-13', visits: 819 },
 { d: '2012-10-14', visits: 849 },
 { d: '2012-10-15', visits: 870 },
 { d: '2012-10-16', visits: 1063 },
 { d: '2012-10-17', visits: 1192 },
 { d: '2012-10-18', visits: 1224 },
 { d: '2012-10-19', visits: 1329 },
 { d: '2012-10-20', visits: 1329 },
 { d: '2012-10-21', visits: 1239 },
 { d: '2012-10-22', visits: 1190 },
 { d: '2012-10-23', visits: 1312 },
 { d: '2012-10-24', visits: 1293 },
 { d: '2012-10-25', visits: 1283 },
 { d: '2012-10-26', visits: 1248 },
 { d: '2012-10-27', visits: 1323 },
 { d: '2012-10-28', visits: 1390 },
 { d: '2012-10-29', visits: 1420 },
 { d: '2012-10-30', visits: 1529 },
 { d: '2012-10-31', visits: 1892 },
 ],
 // The name of the data record attribute that contains x-visitss.
 xkey: 'd',
 // A list of names of data record attributes that contain y-visitss.
 ykeys: ['visits'],
 // Labels for the ykeys -- will be displayed when you hover over the
 // chart.
 labels: ['Visits'],
 // Disables line smoothing
 smooth: true
 });*/

var data = [],
  totalPoints = 60;

function getBaseline() {
  var seriesA = [];
  var seriesB = []
  for (var i = 0; i < totalPoints; i++) {
    seriesA.push([i, 0]);
    seriesB.push([i, 0]);
  }
  return [seriesA, seriesB];
}

function getRandomData() {

  if (data.length > 0)
    data = data.slice(1);

  // Do a random walk
  while (data.length < totalPoints) {

    var prev = data.length > 0 ? data[data.length - 1] : 50,
      y = prev + Math.random() * 10 - 5;

    if (y < 0) {
      y = 0;
    } else if (y > 100) {
      y = 100;
    }

    data.push(y);
  }

  // Zip the generated y values with the x values

  var res = [];
  for (var i = 0; i < data.length; ++i) {
    res.push([i, data[i]])
  }
  return res;
}


var plot = $.plot('#dashboard-chart', getBaseline(), {
  series: {

    shadowSize: 0	// Drawing is faster without shadows
  },
  yaxis: {
    min: 0,
    max: 100
  },
  xaxis: {
    show: false
  }
});

function IsNumeric(input)
{
  return (input - 0) == input && (input+'').replace(/^\s+|\s+$/g, "").length > 0;
}

function updatePlot(data) {
  plot.setData(data);
  // Since the axes don't change, we don't need to call plot.setupGrid()
  plot.draw();
  //setTimeout(updatePlot, 1000);
}

joolaio.io.socket.on('stats:events', function (message) {
  //first let's parse out the cpu usage
  var cpu = message['stats:events:usage-cpu'];
  var mem = message['stats:events:usage-mem'];

  var cpuSum = 0;

  var i = 0;
  cpu.forEach(function (item) {
    item[0] = i;
    if (IsNumeric(item[1]))
      cpuSum += parseFloat(item[1]);
    else
      item[1] = 0;
    i++;
  });
  var cpuAvg = cpuSum / i;
  cpuAvg = Math.round(cpuAvg * 10) / 10;
  $('.manage-dashboard-metric-load').text(cpuAvg);
  i = 0;
  mem.forEach(function (item) {
    item[0] = i;
    item[1] = parseFloat(item[1]) / 1024 / 1024;
    if (item[1] == 'NaN')
      item[1] = 0;
    i++;
  });
  var data = [cpu, mem];
  updatePlot(data);
});