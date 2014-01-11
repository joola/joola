/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

function POC_setup() {
  // $(document).mousemove(function (event) {
  //  joolaio.dispatch.beacon.insert('mousemove', {timestamp: new Date(), x: event.pageX, y: event.pageY});
  // });

  var wsUri = "ws://ws.blockchain.info:8335/inv";
  var output;

  function init() {
    output = document.getElementById("output");
    testWebSocket();
  }

  function testWebSocket() {
    websocket = new WebSocket(wsUri);
    websocket.onopen = function (evt) {
      onOpen(evt)
    };
    websocket.onclose = function (evt) {
      onClose(evt)
    };
    websocket.onmessage = function (evt) {
      onMessage(evt)
    };
    websocket.onerror = function (evt) {
      onError(evt)
    };
  }

  function onOpen(evt) {
    writeToScreen("CONNECTED");
    doSend('{"op": "status"}');
    doSend('{"op": "unconfirmed_sub"}');
  }

  function onClose(evt) {
    writeToScreen("DISCONNECTED");
  }

  function onMessage(evt) {
    var data = JSON.parse(evt.data).x;

    var inamount = 0;
    var outamount = 0;
    var delta;
    data.inputs.forEach(function (input) {
      if (input.prev_out)
        inamount += input.prev_out.value;
    });
    data.out.forEach(function (out) {
      if (out.value)
        outamount += out.value;
    });

    inamount = inamount / Math.pow(10, 8);
    outamount = outamount / Math.pow(10, 8);
    delta = inamount - outamount;
    joolaio.dispatch.beacon.insert('blockchain', {timestamp: new Date(data.time * 1000), hash: data.hash, relayed_by: data.relayed_by, inamount: inamount, outamount: outamount, delta: delta});
    console.log(JSON.parse(evt.data));

    writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data + '</span>');
  }

  function onError(evt) {
    writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
  }

  function doSend(message) {
    writeToScreen("SENT: " + message);
    websocket.send(message);
  }

  function writeToScreen(message) {
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    output.appendChild(pre);
  }

  init();

  joolaio.dispatch.query.fetch({
    timeframe: 'last_30_minutes',
    interval: 'second',
    realtime: true,
    dimensions: [ 'relayed_by'],
    metrics: ['inamount', 'outamount', {"dependsOn": "delta", "type": "float", "aggregation": "avg"}],
    filter: null
  }, function (err, message) {
    console.log(err, message);
  });
}