function dashboard_setup() {
  var data = [],
    totalPoints = 0;

  function getBaseline() {
    var seriesA = [];
    var seriesB = [];
    for (var i = 0; i < totalPoints; i++) {
      seriesA.push([i, 0]);
      seriesB.push([i, 0]);
    }
    return [
      {data: seriesA, yaxis: 1, hoverable: true, bars: { show: true }},
      {data: seriesB, yaxis: 2, hoverable: true, lines: { show: true, fill: true } }
    ];
  }

  var plot = $.plot('#dashboard-chart', getBaseline(), {
    series: {

    },
    yaxes: [
      {
        position: "left",
        min: 0
      },
      {
        position: "right",
        min: 0
      }
    ],
    xaxis: {
      show: true,
      mode: "time"
    },
    legend: {
      show: true,
      position: "nw",
      noColumns: 5
    },
    grid: {
      hoverable: true,
      clickable: true
    }
  });

  $("<div id='tooltip'></div>").css({
    position: "absolute",
    display: "none",
    border: "1px solid #fdd",
    padding: "2px",
    "background-color": "#fee",
    opacity: 0.80
  }).appendTo("body");

  $("#dashboard-chart").bind("plothover", function (event, pos, item) {


    if (item) {
      var x = item.datapoint[0].toFixed(2),
        y = item.datapoint[1].toFixed(2);

      $("#tooltip").html(item.series.label + " of " + x + " = " + y)
        .css({top: item.pageY + 5, left: item.pageX + 5})
        .fadeIn(200);
    } else {
      $("#tooltip").hide();
    }

  });

  var plots = [
    [],
    [],
    [],
    []
  ];

  function updatePlot() {
    plot.setData(plots);
    // Since the axes don't change, we don't need to call plot.setupGrid()
    plot.setupGrid();
    plot.draw();
    setTimeout(updatePlot, 1000);
  }

  updatePlot();

  function clearColors(elem) {
    elem.removeClass('panel-info');
    elem.removeClass('panel-primary');
    elem.removeClass('panel-warn');
    elem.removeClass('panel-success');
    elem.removeClass('panel-danger');
  }

  joolaio.io.socket.on('stats', function (message) {
    switch (message.id) {
      case 'stats:usage-current':
        var cpuAvg = message.data[0].cpu;
        cpuAvg = Math.round(cpuAvg);
        var $metric = $('.manage-dashboard-metric-load');
        var $panel = $metric.parentsUntil('.panel').parent();

        $metric.text(cpuAvg + '%');

        clearColors($panel);
        if (cpuAvg >= 90)
          $panel.addClass('panel-danger');
        else if (cpuAvg >= 50)
          $panel.addClass('panel-warning');
        else
          $panel.addClass('panel-success');
        break;
      case 'stats:nodecount-current':
        var nodes;
        if (message.data.length > 0)
          nodes = message.data[0].nodes;
        else
          nodes = 0;
        $('.manage-dashboard-metric-nodes').text(nodes);
        break;
      case 'stats:eventlooplocks-current':
        var eventlooplocks;
        if (message.data.length > 0)
          eventlooplocks = message.data[0].eventlooplocks;
        else
          eventlooplocks = 0;

        var $metric = $('.manage-dashboard-metric-elb');
        var $panel = $metric.parentsUntil('.panel').parent();
        $metric.text(eventlooplocks);

        clearColors($panel);
        if (eventlooplocks >= 5)
          $panel.addClass('panel-danger');
        else if (eventlooplocks >= 1)
          $panel.addClass('panel-warning');
        else
          $panel.addClass('panel-success');
        break;
      case 'stats:waittime-current':
        var waittime;
        if (message.data.length > 0)
          waittime = message.data[0].waittime;
        else
          waittime = 0;

        var $metric = $('.manage-dashboard-metric-waittime');
        var $panel = $metric.parentsUntil('.panel').parent();
        $metric.text(waittime);

        clearColors($panel);
        if (waittime >= 1000)
          $panel.addClass('panel-danger');
        else if (waittime >= 100)
          $panel.addClass('panel-warning');
        else
          $panel.addClass('panel-success');
        break;
      case 'stats:usage-lasthour':
        var cpuSeries = [];
        var memSeries = [];

        var counter = 0;
        message.data.forEach(function (row) {
          if (row[0])
            row = row[0];
          else
            row = {_id: new Date(row._id).getTime(), cpu: 0, mem: 0}
          cpuSeries.push([new Date(row._id).getTime(), row.cpu ]);
          memSeries.push([new Date(row._id).getTime(), row.mem > 0 ? row.mem / 1024 / 1024 : 0]);

          counter++;

        });
        //memSeries.pop();
        var data = [
          {data: memSeries, label: 'Memory (MB)', yaxis: 2, hoverable: true, lines: { show: true }},
          {data: cpuSeries, label: 'System Load %', yaxis: 1, hoverable: true, lines: { show: true}}
        ];

        plots[0] = data[0];
        plots[1] = data[1];
        //updatePlot(data);

        break;
      case 'stats:events-lasthour':
        var eventsSeries = [];

        var counter = 0;
        message.data.forEach(function (row) {
          if (row[0])
            row = row[0];
          else
            row = {_id: new Date(row._id).getTime(), events: 0}

          eventsSeries.push([new Date(row._id).getTime(), row.events ]);
          counter++;

        });
        var data = [
          {data: eventsSeries, label: 'Events', yaxis: 2, hoverable: true, lines: { show: true}}
        ];

        plots[2] = data[0];
        //updatePlot(data);

        break;
      case 'stats:eventlooplocks-lasthour':
        break;
      case 'stats:waittime-lasthour':
        var timeSeries = [];

        var counter = 0;
        message.data.forEach(function (row) {
          if (row[0])
            row = row[0];
          else
            row = {_id: new Date(row._id).getTime(), waittime: 0}

          timeSeries.push([new Date(row._id).getTime(), row.waittime ]);
          counter++;

        });
        var data = [
          {data: timeSeries, label: 'Wait Time', yaxis: 2, hoverable: true, lines: { show: true}}
        ];

        plots[3] = data[0];
        //updatePlot(data);

        break;
      case 'stats:events-current':
        var events;
        if (message.data.length > 0)
          events = message.data[0].events;
        else
          events = 0;

        var $metric = $('.manage-dashboard-metric-eps');

        $metric.text(events);
        break;
      case 'stats:tokens-current':
        var tokens;
        if (message.data.length > 0)
          tokens = message.data[0].tokens;
        else
          tokens = 0;

        var $metric = $('.manage-dashboard-metric-tokens');

        $metric.text(tokens);
        break;
      case 'stats:fulfillment-current':
        var fulfillment;
        if (message.data.length > 0)
          fulfillment = message.data[0].fulfillment;
        else
          fulfillment = 0;

        var $metric = $('.manage-dashboard-metric-fulfilled');

        $metric.text(fulfillment + '%');
        break;
      default:
        break;
    }
  });
}