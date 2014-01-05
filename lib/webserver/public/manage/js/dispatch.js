function dispatch_setup() {
  var known = [];
  var paused = false;

  function updateNode(message) {
    if (paused)
      return;
    var $container = $('.nodeitem[message-id="' + message.id + '"]');
    var $panel = $container.find('.panel');

    $container.attr('message-id', message.id);
    $container.find('.message-channel').html(message.channel);
    $container.find('.message-from').html(message.from);
    $container.find('.message-to').html((message['fulfilled-by'] != 'null' ? message['fulfilled-by'] : ''));
    $container.find('.message-since').html((message['fulfilled-duration'] ? message['fulfilled-duration'] + 'ms' : ''));

    console.log(message.result);

    if (message.result && message.result != '{}') {
      $container.data('result', message.result);
    }
    else
      $container.data('result', '');

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
    if (paused)
      return;
    var remove = function () {
      if (paused) {
        setTimeout(remove, 3000);
        return;
      }
      $container.fadeOut('slow', function () {
        $(this).remove();
        delete known[known.indexOf(message.id)];
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
    if (paused)
      return;
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

    var _paused;
    if (message.payload && message.payload != '{}') {
      $container.find('.icon-payload').clickover({
        trigger: 'click',
        title: 'Payload for message [' + message.id + ']',
        content: message.payload,
        placement: 'left',
        global_close: true,
        esc_close: true,
        //width:350,
        template: '<div class="popover" style="left:-170px !important;"><div class="arrow" style="top:65px;"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class=""><pre class="popover-content prettyprint languague-js"></pre></div></div></div>',
        onShown: function () {
          _paused = paused;
          pause();
        },
        onHidden: function () {
          if (!_paused)
            resume();
        }
      });
    }
    else
      $container.find('.icon-payload').hide();

    //if (message.result && message.result != '{}') {
    $container.find('.icon-result').clickover({
      trigger: 'click',
      title: 'Result for message [' + message.id + ']',
      content: message.result,
      placement: 'left',
      global_close: true,
      esc_close: true,
      //width:350,
      template: '<div class="popover" style="left:-155px !important;"><div class="arrow" style="top:65px;"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class=""><pre class="popover-content prettyprint languague-js"></pre></div></div></div>',
      onShown: function () {
        var $this = $(this);
        var $tip = $($this[0].$tip[0]);
        $tip.find('.popover-content').html( $container.data('result'));
        _paused = paused;
        pause();
      },
      onHidden: function () {
        if (!_paused)
          resume();
      }
    });

    // }
    //else
    //  $container.find('.icon-result').hide();

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


  function pause() {
    paused = true;
    $('.playcontrols').find('.playicon').removeClass('fa-pause').addClass('fa-play');
  }

  function resume() {
    paused = false;
    $('.playcontrols').find('.playicon').removeClass('fa-play').addClass('fa-pause');
  }

  $('.btn-pause').on('click', function () {
    paused = !paused;
    if (paused)
      pause();
    else
      resume();
  });
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
}, getRandomInt(500, 1500));

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

var obj = {a:1, 'b':'foo', c:[false,'false',null, 'null', {d:{e:1.3e5,f:'1.3e5'}}]};
var str = JSON.stringify(obj, undefined, 4);

