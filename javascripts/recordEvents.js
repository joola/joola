$().ready(function () {
  function randomIP() {
    function getOctet() {
      return Math.round(Math.random() * 255);
    }

    var ipaddress_string = getOctet()
      + '.' + getOctet()
      + '.' + getOctet()
      + '.' + getOctet();
    return ipaddress_string;
  }

  var userid = joola.common.uuid();
  var ip = randomIP();

  joola.on('ready', function () {
    try {
      joola.insert('visits', {
        timestamp: null,
        browser: $.ua.browser.name,
        device: $.ua.device.name,
        engine: $.ua.engine.name,
        os: $.ua.os.name,
        userid: userid,
        ip: ip,
        referrer: document.referrer,
        visits: 1,
        loadtime_ms: Math.floor(Math.random() * (120 - 10 + 1) + 10)
      }, {});

      document.onclick = function (event) {
        try {
          joola.insert('clicks', {
            timestamp: null,
            browser: $.ua.browser.name,
            device: $.ua.device.name,
            engine: $.ua.engine.name,
            os: $.ua.os.name,
            userid: userid,
            ip: ip,
            referrer: document.referrer,
            clicks: 1
          }, {});
        }
        catch (ex) {
          $('#log').append('<div>' + ex + '</div>');
          console.log(ex);
        }
      };

      var iTimeoutMoves = 0;
      var moves = 0;
      document.onmousemove = function (event) {
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
                ip: ip,
                referrer: document.referrer,
                moves: moves
              };
              joola.insert('moves', doc, {});
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
          //$('#log').append('<div>' + ex + '</div>');
          console.log(ex);
        }
      };
    }
    catch (ex) {
      //$('#log').append('<div>' + ex + '</div>');
      console.log(ex);
    }
  });
});