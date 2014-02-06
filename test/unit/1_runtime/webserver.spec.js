var
  path = require('path'),
  request = require('request');

describe("webserver", function () {
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