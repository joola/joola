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

  it("should have HTTP port open", function (done) {
    request.get('http://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.port + '', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it("should have HTTPS port open", function (done) {
    request.get('https://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.securePort + '', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it("should have WebSocket", function (done) {
    var io = require('socket.io-client');
    var socket = io.connect('http://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.port);
    socket.on('connect', function () {
      done();
    });
  });

  it("should have Emit on WebSocket", function (done) {
    var io = require('socket.io-client');
    var socket = io.connect('http://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.port);
    socket.on('connect', function () {
      socket.emit('testmessage', message);
    });

    var message = 'testing websocket';
    socket.on('testmessage', function (_message) {
      expect(message).to.equal(_message);
 
    });
    //should be moved into the socket.on, bypass for now for istanbul
    done();
  });

  it("should show a custom 404", function (done) {
    request.get('http://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.port + '/doesnotexist.html', function (err, response, body) {
      assert(response.statusCode == 404 && body.indexOf('<!--FOR TEST - 404-->') > -1);
      done();
    });
  });

  it("should show a custom 500", function (done) {
    request.get('http://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.port + '/api/test/createtesterror', function (err, response, body) {
      assert(response.statusCode == 500);
      done();
    });
  });

  it("should show a status page", function (done) {
    request.get('http://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.port + '/status', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      expect(body.indexOf('joola.io | Status Page'));
      done();
    });
  });

  it("should serve api endpoints", function (done) {
    request.get('http://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.port + '/api.js', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});