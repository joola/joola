function nodes_setup() {
  joolaio.io.socket.on('stats', function (message) {
    switch (message.id) {
      case 'stats:usage-current':
        var cpuAvg = message.data[0].cpu;
        cpuAvg = Math.round(cpuAvg);
        $('.manage-dashboard-metric-load').text(cpuAvg + '%');
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

  /*
   Morris.Donut({
   element: 'morris-chart-donut',
   data: [
   {label: "Query", value: 42.7},
   {label: "Cache", value: 8.3},
   {label: "Meta", value: 12.8}
   ],
   formatter: function (y) { return y + "%" ;}
   });
   */
  //Flot Chart Dynamic Chart

  $(function () {

    var container = $("#flot-chart-moving-line");

    // Determine how many data points to keep based on the placeholder's initial size;
    // this gives us a nice high-res plot while avoiding more than one point per pixel.

    var maximum = container.outerWidth() / 2 || 300;

    //

    var data = [];

    function getRandomData() {

      if (data.length) {
        data = data.slice(1);
      }

      while (data.length < maximum) {
        var previous = data.length ? data[data.length - 1] : 50;
        var y = previous + Math.random() * 10 - 5;
        data.push(y < 0 ? 0 : y > 100 ? 100 : y);
      }

      // zip the generated y values with the x values

      var res = [];
      for (var i = 0; i < data.length; ++i) {
        res.push([i, data[i]])
      }

      return res;
    }

    //

    series = [
      {
        data: getRandomData(),
        lines: {
          fill: true
        }
      }
    ];

    //

    var plot = $.plot(container, series, {
      grid: {
        borderWidth: 0,
        minBorderMargin: 0,
        labelMargin: 0,
        backgroundColor: {
          colors: ["#fff", "#fff"]
        },
        margin: 0,
        markings: function (axes) {
          var markings = [];
          var xaxis = axes.xaxis;
          for (var x = Math.floor(xaxis.min); x < xaxis.max; x += xaxis.tickSize * 2) {
            markings.push({ xaxis: { from: x, to: x + xaxis.tickSize }, color: "rgba(103, 157, 198, 0.2)" });
          }
          return markings;
        }
      },
      xaxis: {
        show: false,
        tickFormatter: function () {
          return "";
        }
      },
      yaxis: {
        show: false,
        min: 0,
        max: 110
      },
      legend: {
        show: false
      }
    });

    // Update the random dataset at 25FPS for a smoothly-animating chart

    setInterval(function updateRandom() {
      series[0].data = getRandomData();
      plot.setData(series);
      plot.draw();
    }, 40);

  });

  $('input[type="checkbox"],[type="radio"]').not('#create-switch').bootstrapSwitch();

  (function () {
    var data = [];

    data.push({
      label: 'Emits',
      data: 25
    });
    data.push({
      label: 'On',
      data: 30
    });
    data.push({
      label: 'EmitWait',
      data: 45
    });

    function labelFormatter(label, series) {
      return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
    }

    console.log(data);
    $.plot('#morris-chart-donut', data, {
      series: {
        pie: {
          show: true,
          radius: 500,
          label: {
            show: false,
            formatter: labelFormatter,
            threshold: 0.1
          }
        }
      },
      legend: {
        show: false
      }
    });
  })();
}
