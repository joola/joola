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
    request.get('https://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.securePort+ '', function (err, response, body) {
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

  xit("should have WebSocket", function (done) {
    var called = false;
    var io = require('socket.io-client');
    var socket = io.connect('https://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.securePort);
    socket.on('connect', function () {
      socket.disconnect();
      if (!called) {
        called = true;
        done();
      }
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

  it("should have valid route on WebSocket", function (done) {
    var io = require('socket.io-browserify');
    io.socket = joolaio.io.connect(joolaio.options.host);
    io.socket.once('/workspaces/list:done', function (_message) {
      done();
    });
    var options =
      {
        APIToken: 'apitoken-test',
        _path: '/workspaces/list'
      }
      ;
    io.socket.emit('/workspaces/list', options);
  });

  it("should return on WebSocket route with no details", function (done) {
    var io = require('socket.io-browserify');
    io.socket = joolaio.io.connect(joolaio.options.host);
    io.socket.once('/workspaces/list:done', function (_message) {
      done();
    });
    io.socket.emit('/workspaces/list');
  });

  it("should serve api endpoints", function (done) {
    request.get('https://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.securePort + '/meta', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  xit("should serve api endpoints [system version]", function (done) {
    request.get('https://' + joola.config.interfaces.webserver.host + ':' + joola.config.interfaces.webserver.securePort + '/system/version?APIToken=apitoken-demo', function (err, response, body) {
      if (err)
        return done(err);

      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});