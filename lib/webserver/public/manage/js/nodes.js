var plots = {};

function updateNode(node) {
  var $container = $('.nodeitem[node-uid="' + node.uid + '"]');

  var onlineTimestamp = new Date(new Date().getTime() - (node.uptime * 1000));
  var uptime = $.timeago(onlineTimestamp).replace(' ago', '');
  var lastseen = new Date(node['last-seen-nice']).format('hh:mm:ss');
  $container.find('.node-uptime').html(lastseen + ' <small> (up for ' + uptime + ')</small>');
  node['usage-cpu'] = parseFloat(node['usage-cpu']);
  node['usage-mem'] = parseFloat(node['usage-mem']);

  $container.find('.node-cpu').html(Math.round(node['usage-cpu']) + '%');
  $container.find('.node-memory').html(Math.round(node['usage-mem'] / 1024 / 1024) + 'mb');

  var data = $container.data('plot');

  if (data.length >= 60)
    data.shift(1);
  data.push([0, node['usage-cpu']]);

  for (var i = 0; i < data.length; i++) {
    data[i][0] = i;
  }

  var series = [
    {
      data: data,
      lines: {
        fill: true
      }
    }
  ];

  series[0].data = data;
  var plot = plots[node.uid];
  plot.setData(series);
  plot.draw();
}

function removeNode(node) {
  var $container = $('.nodeitem[node-uid="' + node + '"]');

  $container.find('.panel-heading').addClass('panel-heading-danger');
  setTimeout(function () {
    $container.fadeOut('slow', function () {
      $(this).remove();
    });
  }, 3000);
}

function addNode(node) {
  var $template = $('.template-node');
  var $container = $template.clone();
  $container.removeClass('template-node');
  $container.removeClass('hidden');
  var $panel = $('.nodelist');

  $panel.append($container);
  $container.attr('node-uid', node.uid);
  $container.find('.node-caption').html('&nbsp;' + node.hostname + ':' + node.uid);
  var onlineTimestamp = new Date(new Date().getTime() - (node.uptime * 1000));
  var uptime = $.timeago(onlineTimestamp).replace(' ago', '');
  var lastseen = new Date(node['last-seen-nice']).format('hh:mm:ss');
  $container.find('.node-uptime').html(lastseen + ' <small> (up for ' + uptime + ')</small>');
  node['usage-cpu'] = parseFloat(node['usage-cpu']);
  node['usage-mem'] = parseFloat(node['usage-mem']);

  $container.find('.node-cpu').html(Math.round(node['usage-cpu']) + '%');
  $container.find('.node-memory').html(Math.round(node['usage-mem'] / 1024 / 1024) + 'mb');

  $container.find('.flot-chart-moving-line').attr('id', 'chart-' + node.uid);

  var container = $('#' + 'chart-' + node.uid);
  var data = $container.data('plot');
  if (!data) {
    data = [];
    for (var i = 0; i < 60; i++)
      data.push([i, 0]);
  }


  data.push([data.length + 1, node['usage-cpu']]);
  $container.data('plot', data);

  var series = [
    {
      data: data,
      lines: {
        fill: true
      }
    }
  ];
  plots[node.uid] = $.plot(container, series, {
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

  return;


  $('input[type="checkbox"],[type="radio"]').not('#create-switch').bootstrapSwitch();

  var piedata = [];

  piedata.push({
    label: 'Emits',
    data: 25
  });
  piedata.push({
    label: 'On',
    data: 30
  });
  piedata.push({
    label: 'EmitWait',
    data: 45
  });

  function labelFormatter(label, series) {
    return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
  }

  $.plot('#morris-chart-donut', piedata, {
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
}

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

  var knownNodes = [];
  setInterval(function () {
    joolaio.dispatch.system.listnodes(function (err, nodes) {
      //check for additions or updates
      nodes.forEach(function (node) {
        if (knownNodes.indexOf(node.uid) > -1) {
          updateNode(node);
        }
        else {
          knownNodes.push(node.uid);
          addNode(node);
        }

      });
      //check for removals
      var _clean = [];
      knownNodes.forEach(function (known) {
        var found = false;
        nodes.forEach(function (node) {
          if (node.uid == known)
            found = true;
        });
        if (!found) {
          removeNode(known);
        }
        else
          _clean.push(known);
      });
      knownNodes = _clean;
    });
  }, 2000);
}
