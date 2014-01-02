
function dispatch_setup() {
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

  function updateNode(message) {
    var $container = $('.nodeitem[message-id="' + message.id + '"]');

    console.log('update', message.picked);
    $container.find('.message-channel').html(message.channel);
    $container.find('.message-status').html(parseInt(message.picked) > 0 ? 'Picked' : 'Pending');
  }

  function removeNode(message) {
    var $container = $('.nodeitem[message-id="' + message.id + '"]');

    $container.find('.panel-heading').addClass('panel-heading-danger');
    setTimeout(function () {
      $container.fadeOut('slow', function () {
        $(this).remove();
      });
    }, 3000);
  }

  function addNode(message) {
    var $template = $('.template-node');
    var $container = $template.clone();
    $container.removeClass('template-node');
    $container.removeClass('hidden');
    var $panel = $('.nodelist');

    $container.attr('message-id', message.id);
    $panel.append($container);

    console.log(message.channel);
    $container.find('.message-channel').html(message.channel);
    $container.find('.message-status').html(parseInt(message.picked) > 0 ? 'Picked' : 'Pending');
  }

  console.log(joolaio.io.socket.socket.sessionid);
  joolaio.dispatch.system.subscribe_dispatch(joolaio.io.socket.socket.sessionid, function (err, done) {
    console.log('done', err, done);
  });

  var known = [];
  joolaio.io.socket.on('dispatch', function (message) {
    console.log(message);
    if (known.indexOf(message.id) > -1) {
      updateNode(message);
    }
    else {
      known.push(message.id);
      addNode(message);
    }
  });

  setInterval(function () {
    var _clean = [];
    known.forEach(function (k) {
      _clean.push(k);
    });
    known = _clean;
  }, 1000);
}
