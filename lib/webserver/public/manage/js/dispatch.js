
function dispatch_setup() {
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

  setup_dispatch();
}
