var
  path = require('path'),
  request = require('request');

describe("webserver", function () {
  it("should verify server is online", function (done) {
    joola.webserver.verify(function (err) {
      done(err);
    });
  });

  it("should stop web server", function (done) {
    joola.webserver.stop(function (err) {
      if (err)
        return done(err);
      setTimeout(done, 2000);
    });
  });

  it("should verify server is offline", function (done) {
    joola.webserver.verify(function (err) {
      if (err)
        return done();

      return done(new Error('This should not fail'));
    });
  });

  it("should start web server", function (done) {
    joola.webserver.start({}, function (err) {
      done(err);
    });
  });

  it("should not fail if no --webserver switch", function (done) {
    joola.webserver.start({}, function (err) {
      return done(err);
    });
  });

  it("should fail if --webserver switch", function (done) {
    joola.webserver.start({webserver: true}, function (err) {
      if (err)
        return done();

      return done(new Error('This should not fail'));
    });
  });

  xit("should have HTTP port open", function (done) {
    request.get('https://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.secureport + '', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it("should have HTTPS port open", function (done) {
    request.get('https://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.secureport + '', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it("should have WebSocket", function (done) {
    var WebSocket = require('ws');
    var wsPath = '';
    if (joolaio.options.host.indexOf('https://') > -1)
      wsPath = 'wss://' + joolaio.options.host.replace('https://', '');
    else
      wsPath = 'ws://' + joolaio.options.host.replace('http://', '');

    console.log(wsPath);
    var ws = new WebSocket(wsPath);
    

    ws.on('open', function () {
      ws.send('something');
      console.log('optn');
    });
    ws.on('message', function (data, flags) {
      console.log('message');
      // flags.binary will be set if a binary data is received
      // flags.masked will be set if the data was masked
    });
  });

  xit("should have Emit on WebSocket", function (done) {
    var io = require('socket.io-browserify');
    io.socket = joolaio.io.connect(joolaio.options.host);
    var message = 'this is a test message';
    io.socket.on('testmessage', function (_message) {
      expect(_message).to.equal(message);
      done();
    });
    io.socket.emit('testmessage', message);
  });

  xit("should have valid route on WebSocket", function (done) {
    var io = require('socket.io-browserify');
    console.log(joolaio.options.host);
    io.socket = joolaio.io.connect(joolaio.options.host);
    io.socket.once('/workspaces/list:done', function (_message) {
      done();
    });
    var options =
    {
      APIToken: 'apitoken-test',
      _path: '/workspaces/list'
    };
    io.socket.emit('/workspaces/list', options);
  });

  xit("should return on WebSocket route with no details", function (done) {
    var io = require('socket.io-browserify');
    io.socket = joolaio.io.connect(joolaio.options.host);
    io.socket.once('/workspaces/list:done', function (_message) {
      done();
    });
    io.socket.emit('/workspaces/list');
  });

  it("should serve api endpoints", function (done) {
    request.get('https://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.secureport + '/meta', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  xit("should serve api endpoints [system version]", function (done) {
    request.get('https://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.secureport + '/system/version?APIToken=apitoken-demo', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});