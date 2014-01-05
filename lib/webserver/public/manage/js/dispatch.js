function dispatch_setup() {

  function updateNode(message) {
    var $container = $('.nodeitem[message-id="' + message.id + '"]');
    var $panel = $container.find('.panel');

    $container.attr('message-id', message.id);
    $container.find('.message-channel').html(message.channel);
    $container.find('.message-from').html(message.from);
    $container.find('.message-to').html((message['fulfilled-by'] != 'null' ? message['fulfilled-by'] : ''));
    $container.find('.message-since').html((message['fulfilled-duration'] ? message['fulfilled-duration'] + 'ms' : ''));

    console.log($container.data('WaitTimerID'));
    clearTimeout($container.data('WaitTimerID'));
    colorNode($container, $panel, message);

    expireNode($container, message);

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

  function expireNode($container, message) {
    var remove = function () {
      $container.fadeOut('slow', function () {
        $(this).remove();
      });
    };
    var timeout = 0;
    if (message.fulfilled > 0) {
      timeout = 3000;
    }
    else if (message.picked > 0) {
      timeout = 0;
    }
    else {
      timeout = 0;
    }

    if (timeout > 0)
      setTimeout(remove, timeout);
  }

  function colorNode($container, $panel, message) {
    message.picked = parseInt(message.picked, 10);
    message.fulfilled = parseInt(message.fulfilled, 10);

    clearColors($panel);

    if (message.fulfilled > 0) {
      $container.find('.message-status').html('Fulfilled');
      $panel.addClass('panel-success');
    }
    else if (message.picked > 0) {
      $container.find('.message-status').html('Picked');
      $panel.addClass('panel-primary');
    }
    else {
      $container.find('.message-status').html('Pending');
      $panel.addClass('panel-info');
    }
    expireNode($container, message);
  }

  function addNode(message) {
    var $template = $('.template-node');
    var $container = $template.clone();
    $container.removeClass('template-node');
    $container.removeClass('hidden');
    $('.nodelist').prepend($container);
    var $panel = $container.find('.panel');

    $container.attr('message-id', message.id);
    $container.find('.message-channel').html(message.channel);
    $container.find('.message-from').html(message.from);
    $container.find('.message-to').html((message['fulfilled-by'] != 'null' ? message['fulfilled-by'] : '--------'));
    $container.find('.message-since').html((message['fulfilled-duration'] ? message['fulfilled-duration'] + 'ms' : ''));

    colorNode($container, $panel, message);
    var sinceCounter = function () {
      var diff = new Date() - new Date(parseInt(message.timestamp, 10));
      $container.find('.message-since').html((message['fulfilled-duration'] ? message['fulfilled-duration'] + 'ms' : diff + 'ms'));
      $container.data('WaitTimerID', setTimeout(sinceCounter, 1000));
    };
    if (!message['fulfilled-duration'])
      $container.data('WaitTimerID', setTimeout(sinceCounter, 1000));

  }

  joolaio.dispatch.system.subscribe_dispatch(joolaio.io.socket.socket.sessionid, function (err, done) {

  });

  var known = [];
  joolaio.io.socket.on('dispatch', function (message) {
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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var counter = 1;
setInterval(function () {
  joolaio.dispatch.users.list();
  if (counter % getRandomInt(11, 17) == 0)
    joolaio.dispatch.system.block();
  counter++;
}, getRandomInt(50, 500));
