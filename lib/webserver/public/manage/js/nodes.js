function nodes_setup() {
  var
    seriesCPU = [],
    seriesEvents = [],
    data = [seriesCPU, seriesEvents],
    totalPoints = 60;

  function getBaseline() {
    for (var i = 0; i < totalPoints; i++) {
      seriesCPU.push([i, 0]);
      seriesEvents.push([i, 0]);
    }
    return [
      {data: seriesCPU, yaxis: 1, hoverable: true, lines: { show: true }},
      {data: seriesEvents, yaxis: 2, hoverable: true, lines: { show: true }}
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

  function updatePlot() {
    plot.setData(data);
    plot.setupGrid();
    // Since the axes don't change, we don't need to call plot.setupGrid()
    plot.draw();
  }

  joolaio.io.socket.on('stats', function (message) {
    switch (message.id) {
      case 'stats:usage-current':
        var cpuAvg = message.data[0].cpu;
        cpuAvg = Math.round(cpuAvg);
        $('.manage-dashboard-metric-load').text(cpuAvg + '%');
        break;
      case 'stats:usage-lasthour':
        var counter = 0;
        var _series = [];
        message.data.forEach(function (row) {
          if (row[0])
            row = row[0];
          else
            row = {_id: row._id, cpu: -1, mem: -1};
          _series.push([counter, row.cpu ]);
          counter++;
        });
        data[0] = _series;
        updatePlot();

        break;
      case 'stats:eventlooplocks-current':
        var eventlooplocks;
        if (message.data.length > 0)
          eventlooplocks = message.data[0].eventlooplocks;
        else
          eventlooplocks = 0;
        $('.manage-dashboard-metric-event-loop-blocks').text(eventlooplocks);
        break;
      case 'stats:eventlooplocks-lasthour':

        break;
      case 'stats:events-current':
        var events;
        if (message.data.length > 0)
          events = message.data[0].events;
        else
          events = 0;
        $('.manage-dashboard-metric-events').text(events);
        break;
      case 'stats:events-lasthour':
        var counter = 0;
        var _series = [];
        message.data.forEach(function (row) {
          if (row[0])
            row = row[0];
          else
            row = {_id: row._id, events: -1};
          _series.push([counter, row.events]);
          counter++;
        });
        data[1] = _series;
        updatePlot();
        break;
      case 'stats:nodecount-current':
        var nodes;
        if (message.data.length > 0)
          nodes = message.data[0].nodes;
        else
          nodes = 0;
        $('.manage-dashboard-metric-nodes').text(nodes);
        break;
      default:
        break;
    }
  });
}