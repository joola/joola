function dashboard_setup() {
  var data = [],
    totalPoints = 60;

  function getBaseline() {
    var seriesA = [];
    var seriesB = [];
    for (var i = 0; i < totalPoints; i++) {
      seriesA.push([i, 0]);
      seriesB.push([i, 50]);
    }
    return [
      {data: seriesA, yaxis: 1, hoverable: true, lines: { show: true }},
      {data: seriesB, yaxis: 2, hoverable: true, lines: { show: true, fill: true } }
    ];
  }

  var plot = $.plot('#dashboard-chart', getBaseline(), {
    series: {
      shadowSize: 0	// Drawing is faster without shadows
    },
    yaxes: [
      {
        position: "left",
        min: 0,
        max: 100
      },
      {
        position: "right",
        min: 0,
        max: 400
      }
    ],
    xaxis: {
      show: false
    }
  });

  function updatePlot(data) {
    plot.setData(data);
    // Since the axes don't change, we don't need to call plot.setupGrid()
    plot.draw();
    //setTimeout(updatePlot, 1000);
  }

  joolaio.io.socket.on('stats', function (message) {
    switch (message.id) {
      case 'stats:usage-current':
        var cpuAvg = message.data[0].cpu;
        cpuAvg = Math.round(cpuAvg * 10) / 10;
        $('.manage-dashboard-metric-load').text(cpuAvg);
        break;
      case 'stats:usage-lasthour':
        var cpuSeries = [];
        var memSeries = [];

        var counter = 0;
        message.data.forEach(function (row) {
          if (row[0])
            row = row[0];
          else
            row = {_id: row._id, cpu: -1, mem: -1};
          cpuSeries.push([counter, row.cpu ]);
          memSeries.push([counter, row.mem > 0 ? row.mem / 1024 / 1024 : -1]);
          counter++;
        });
        var data = [
          {data: memSeries, yaxis: 2, hoverable: true, lines: { show: true }},
          {data: cpuSeries, yaxis: 1, hoverable: true, lines: { show: true, fill: true }}
        ];
        updatePlot(data);

        break;
      case 'stats:eventlooplocks-current':
        var eventlooplocks;
        if (message.data.length > 0)
          eventlooplocks = message.data[0].eventlooplocks;
        else
          eventlooplocks = 0;
        console.log(eventlooplocks);
        break;
      case 'stats:eventlooplocks-lasthour':
        break;
      default:
        break;
    }
  });
}