var
  path = require('path'),
  request = require('request');

describe("webserver", function () {
  it("should verify server is online", function (done) {
    engine.webserver.verify(function (err) {
      done(err);
    });
  });

  it("should stop web server", function (done) {
    engine.webserver.stop(function (err) {
      if (err)
        return done(err);
      setTimeout(done, 2000);
    });
  });

  it("should verify server is offline", function (done) {
    engine.webserver.verify(function (err) {
      if (err)
        return done();

      return done(new Error('This should not fail'));
    });
  });

  it("should start web server", function (done) {
    engine.webserver.start({}, function (err) {
      done(err);
    });
  });

  it("should not fail if no --webserver switch", function (done) {
    engine.webserver.start({}, function (err) {
      return done(err);
    });
  });

  it("should fail if --webserver switch", function (done) {
    engine.webserver.start({webserver: true}, function (err) {
      if (err)
        return done();

      return done(new Error('This should not fail'));
    });
  });

  it("should have HTTP port open", function (done) {
    request.get('http://localhost:' + engine.config.interfaces.webserver.port + '', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it("should have HTTPS port open", function (done) {
    request.get('https://localhost:' + engine.config.interfaces.webserver.secureport + '', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it("should have WebSocket", function (done) {
    var io = require('socket.io-client').connect(joola.options.host, {"force new connection": true});
    io.on('connect', function () {
      return done();
    });

  });

  it("should have Emit on WebSocket", function (done) {
    var io = require('socket.io-client').connect(joola.options.host, {"force new connection": true});
    io.on('connect', function () {

    });

    io.on('echo', function () {
      return done();
    });
    io.emit('echo');
  });

  it("should have valid route on WebSocket", function (done) {
    var io = require('socket.io-client').connect(joola.options.host, {"force new connection": true});
    io.on('connect', function () {

    });
    io.on('system/version:done', function (_message) {
      expect(_message).to.be.ok;
      expect(_message.headers).to.be.ok;
      expect(_message.headers.StatusCode).to.equal(200);
      return done();
    });
    var options =
    {
      APIToken: 'apitoken-demo',
      _path: 'system/version'
    };
    io.emit('system/version', options);
  });

  it("should fail on invalid route", function (done) {
    var io = require('socket.io-client').connect(joola.options.host, {"force new connection": true});
    io.on('connect', function () {

    });
    io.on('/system/version:done', function (_message) {
      expect(_message).to.be.ok;
      expect(_message.headers).to.be.ok;
      expect(_message.headers.StatusCode).to.equal(401);
      return done();
    });
    var options =
    {
      APIToken: 'apitoken-demo',
      _path: '/system/version'
    };
    io.emit('/system/version', options);
  });

  it("should serve api endpoints", function (done) {
    request.get('http://localhost:' + engine.config.interfaces.webserver.port + '/meta', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it("should serve api endpoints [https]", function (done) {
    request.get('https://localhost:' + engine.config.interfaces.webserver.secureport + '/meta', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it("should serve api endpoints [system version]", function (done) {
    request.get('http://localhost:' + engine.config.interfaces.webserver.port + '/system/version?APIToken=apitoken-demo', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it("should serve api endpoints [system version] [https]", function (done) {
    request.get('https://localhost:' + engine.config.interfaces.webserver.secureport + '/system/version?APIToken=apitoken-demo', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});
