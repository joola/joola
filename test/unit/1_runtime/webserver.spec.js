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
    var called = false;
    var io = require('socket.io-client');
    var socket = io.connect('http://127.0.0.1:' + joola.config.interfaces.webserver.port);
    socket.on('connect', function () {
      socket.disconnect();
      if (!called) {
        called = true;
        done();
      }
    });
  });

  it("should have Secure WebSocket", function (done) {
    var called = false;
    var io = require('socket.io-client');
    var socket = io.connect('https://127.0.0.1:' + joola.config.interfaces.webserver.securePort);
    socket.on('connect', function () {
      socket.disconnect();
      if (!called) {
        called = true;
        done();
      }
    });
  });

  it("should serve api endpoints", function (done) {
    request.get('https://127.0.0.1:' + joola.config.interfaces.webserver.securePort + '/meta', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it("should serve api endpoints [system version]", function (done) {
    request.get('https://127.0.0.1:' + joola.config.interfaces.webserver.securePort + '/system/version?APIToken=apitoken-demo', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});