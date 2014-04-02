function nodes_setup() {
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

    $container.find('.btn-terminate').on('click', function () {
      console.log('terminate');
      joolaio.dispatch.system.terminate(node.uid, function () {
        console.log('terminated');
      });
    });

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
  }

  var knownNodes = [];
  setInterval(function () {
    joolaio.dispatch.system.nodelist(function (err, nodes) {
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

  setup_dispatch();
}
