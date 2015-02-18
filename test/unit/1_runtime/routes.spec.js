var http = require('http');

describe("routes", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    this.workspace = 'test-org-' + engine.common.uuid();
    done();
  });

  it("should return a 401 route [Websocket]", function (done) {
    var savedAPIToken = joola.get('APIToken');
    //manual set of token to avoid failure on token invalid check
    joola._apitoken = '1234';
    joola._token = '1234';
    joola.system.nodeDetails(function (err, details) {
      expect(err).to.be.ok;
      joola.set('APIToken', savedAPIToken);
      done();
    });
  });

  it("should return a 401 route [GET]", function (done) {
    var options = {
      host: 'localhost',
      port: '8080',
      path: '/api/system/nodeDetails'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        return done();
      });

      response.on('error', function (err) {
        return done(err);
      });
    };

    http.request(options, callback).end();
  });

  it("should get the SDK", function (done) {
    var options = {
      host: 'localhost',
      port: '8080',
      path: '/joola.js'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        return done();
      });

      response.on('error', function (err) {
        return done(err);
      });
    };

    http.request(options, callback).end();
  });

  it("should get the SDK [w/ token]", function (done) {
    var options = {
      host: 'localhost',
      port: '8080',
      path: '/joola.js?token=12345'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        return done();
      });

      response.on('error', function (err) {
        return done(err);
      });
    };

    http.request(options, callback).end();
  });

  it("should get the minified SDK", function (done) {
    var options = {
      host: 'localhost',
      port: '8080',
      path: '/joola.min.js'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        return done();
      });

      response.on('error', function (err) {
        return done(err);
      });
    };

    http.request(options, callback).end();
  });

  it("should get the minified SDK [w/ token]", function (done) {
    var options = {
      host: 'localhost',
      port: '8080',
      path: '/joola.min.js?token=12345'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        return done();
      });

      response.on('error', function (err) {
        return done(err);
      });
    };

    http.request(options, callback).end();
  });

  it("should get the CSS", function (done) {
    var options = {
      host: 'localhost',
      port: '8080',
      path: '/joola.css'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        return done();
      });

      response.on('error', function (err) {
        return done(err);
      });
    };

    http.request(options, callback).end();
  });

  it("should get the IP", function (done) {
    var options = {
      host: 'localhost',
      port: '8080',
      path: '/ip'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        return done();
      });

      response.on('error', function (err) {
        return done(err);
      });
    };

    http.request(options, callback).end();
  });

  xit("should create a test error", function (done) {
    var options = {
      host: 'localhost',
      port: '8080',
      path: '/api/test/createtesterror'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        return done();
      });

      response.on('error', function (err) {
        return done(err);
      });
    };

    http.request(options, callback).end();
  });
});