function dispatch_setup() {
  var known = [];
  var criteria = '';
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

    $container.data('message', message);

    if (message.result && message.result != '{}') {
      $container.data('result', message.result);
    }
    else
      $container.data('result', '');

    if (criteria != '') {
      var found = false;
      Object.keys(message).forEach(function (key) {
        var elem = message[key];
        if (elem.indexOf(criteria) > -1) {
          found = true;
        }
      });

      if (!found)
        $container.hide();
      else
        $container.show();
    }
    else
      $container.show();


    clearTimeout($container.data('WaitTimerID'));
    colorNode($container, $panel, message);

    expireNode($container, message);
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

    $container.data('message', message);

    if (criteria != '') {
      var found = false;
      Object.keys(message).forEach(function (key) {
        var elem = message[key];
        if (elem.indexOf(criteria) > -1) {
          found = true;
        }
      });

      if (!found)
        $container.hide();
      else
        $container.show();
    }
    else
      $container.show();

    var _paused;
    if (message.payload && message.payload != '{}') {
      $container.find('.icon-payload').clickover({
        trigger: 'click',
        title: 'Payload for message [' + message.id + ']',
        content: message.payload,
        placement: 'left',
        global_close: true,
        esc_close: true,
        width: 650,
        template: '<div class="popover" style="left:-545px !important;"><div class="arrow" style="top:65px;"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class=""><pre class="popover-content prettyprint lang-js"></pre></div></div></div>',
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
      width: 650,
      template: '<div class="popover" style="left:-530px !important;"><div class="arrow" style="top:65px;"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class=""><pre class="popover-content prettyprint lang-js"></pre></div></div></div>',
      onShown: function () {
        var $this = $(this);
        var $tip = $($this[0].$tip[0]);
        var data = $container.data('result');
        data = JSON.parse(data);
        $tip.find('.popover-content').html(FormatJSON(data), 4);
        _paused = paused;
        pause();
      },
      onHidden: function () {
        if (!_paused)
          resume();
      }
    });

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

  var timerID = 0;
  $('.search').on('keyup', function () {
    var lookup = function () {
      criteria = $('.search').val();

      if (criteria != '') {


        var $containers = $('.nodeitem:not(.hidden)');

        for (var i = 0; i < $containers.length; i++) {
          var found = false;
          var $container = $($containers[i]);
          var message = $container.data('message');
          if (message) {
            Object.keys(message).forEach(function (key) {
              var elem = message[key];
              if (elem.toString().indexOf(criteria) > -1) {
                found = true;
              }
            });
          }
          else {

          }

          if (!found) {
            $container.hide();
          }
        }

      }
    };

    if (timerID > 0)
      clearTimeout(timerID);

    timerID = setTimeout(lookup, 1000);

  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var counter = 1;

function FormatJSON(oData, sIndent) {
  if (arguments.length < 2) {
    var sIndent = "";
  }
  var sIndentStyle = "    ";
  var sDataType = RealTypeOf(oData);

  // open object
  if (sDataType == "array") {
    if (oData.length == 0) {
      return "[]";
    }
    var sHTML = "[";
  } else {
    var iCount = 0;
    $.each(oData, function () {
      iCount++;
      return;
    });
    if (iCount == 0) { // object is empty
      return "{}";
    }
    var sHTML = "{";
  }

  // loop through items
  var iCount = 0;
  $.each(oData, function (sKey, vValue) {
    if (iCount > 0) {
      sHTML += ",";
    }
    if (sDataType == "array") {
      sHTML += ("\n" + sIndent + sIndentStyle);
    } else {
      sHTML += ("\n" + sIndent + sIndentStyle + "\"" + sKey + "\"" + ": ");
    }

    // display relevant data type
    switch (RealTypeOf(vValue)) {
      case "array":
      case "object":
        sHTML += FormatJSON(vValue, (sIndent + sIndentStyle));
        break;
      case "boolean":
      case "number":
        sHTML += vValue.toString();
        break;
      case "null":
        sHTML += "null";
        break;
      case "string":
        sHTML += ("\"" + vValue + "\"");
        break;
      default:
        sHTML += ("TYPEOF: " + typeof(vValue));
    }

    // loop
    iCount++;
  });

  // close object
  if (sDataType == "array") {
    sHTML += ("\n" + sIndent + "]");
  } else {
    sHTML += ("\n" + sIndent + "}");
  }

  // return
  return sHTML;
}

function RealTypeOf(v) {
  if (typeof(v) == "object") {
    if (v === null) return "null";
    if (v.constructor == (new Array).constructor) return "array";
    if (v.constructor == (new Date).constructor) return "date";
    if (v.constructor == (new RegExp).constructor) return "regex";
    return "object";
  }
  return typeof(v);
}