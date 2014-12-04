var timeframe = 'last_hour';
var interval = 'minute';
var realtime = true;
var filter = [];
var userid = joola.common.uuid();


joola.events.on('ready', function () {
  try {
    joola.insert('demo-visits', {
      timestamp: null,
      browser: $.ua.browser.name,
      device: $.ua.device.name,
      engine: $.ua.engine.name,
      os: $.ua.os.name,
      userid: userid,
      ip: codehelper_ip.IP,
      referrer: document.referrer,
      visits: 1,
      loadtime: (window.performance && window.performance.timing ? window.performance.timing.loadEventEnd - window.performance.timing.navigationStart : null)
    }, {});

    $(document).click(function (event) {
      try {
        joola.insert('demo-clicks', {
          timestamp: null,
          browser: $.ua.browser.name,
          device: $.ua.device.name,
          engine: $.ua.engine.name,
          os: $.ua.os.name,
          userid: userid,
          ip: codehelper_ip.IP,
          referrer: document.referrer,
          clicks: 1
        }, {});
      }
      catch (ex) {
        $('#log').append('<div>' + ex + '</div>');
        console.log(ex);
      }
    });

    var iTimeoutMoves = 0;
    var moves = 0;
    $(document).mousemove(function (event) {
      try {
        function pushMoves() {
          if (moves > 0) {
            var doc = {
              timestamp: null,
              browser: $.ua.browser.name,
              device: $.ua.device.name,
              engine: $.ua.engine.name,
              os: $.ua.os.name,
              userid: userid,
              ip: codehelper_ip.IP,
              referrer: document.referrer,
              mousemoves: moves
            };
            joola.insert('demo-mousemoves', doc, {});
            moves = 0;
          }
        }

        clearTimeout(iTimeoutMoves);

        moves++;
        if (moves > 100)
          pushMoves();
        iTimeoutMoves = setTimeout(pushMoves, 100);
      }
      catch (ex) {
        $('#log').append('<div>' + ex + '</div>');
        console.log(ex);
      }
    });
  }
  catch (ex) {
    $('#log').append('<div>' + ex + '</div>');
    console.log(ex);
  }
});
