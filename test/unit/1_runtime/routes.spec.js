var https = require('https');

describe("routes", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = joola.common.uuid();
    this.workspace = 'test-org-' + joola.common.uuid();
    done();
  });

  it("should return a 401 route [Websocket]", function (done) {
    var savedAPIToken = joolaio.get('APIToken');
    //manual set of token to avoid failure on token invalid check
    joolaio._apitoken = '1234';
    joolaio._token = '1234';
    joolaio.system.nodeDetails(function (err, details) {
      expect(err).to.be.ok;
      joolaio.set('APIToken', savedAPIToken);
      done();
    });
  });

  it("should return a 401 route [GET]", function (done) {
    var options = {
      host: 'localhost',
      port: '8081',
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

    https.request(options, callback).end();
  });

  it("should get the SDK", function (done) {
    var options = {
      host: 'localhost',
      port: '8081',
      path: '/joola.io.js'
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

    https.request(options, callback).end();
  });

  it("should get the SDK [w/ token]", function (done) {
    var options = {
      host: 'localhost',
      port: '8081',
      path: '/joola.io.js?token=12345'
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

    https.request(options, callback).end();
  });

  it("should get the minified SDK", function (done) {
    var options = {
      host: 'localhost',
      port: '8081',
      path: '/joola.io.min.js'
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

    https.request(options, callback).end();
  });

  it("should get the minified SDK [w/ token]", function (done) {
    var options = {
      host: 'localhost',
      port: '8081',
      path: '/joola.io.min.js?token=12345'
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

    https.request(options, callback).end();
  });

  it("should get the CSS", function (done) {
    var options = {
      host: 'localhost',
      port: '8081',
      path: '/joola.io.css'
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

    https.request(options, callback).end();
  });

  it("should get the IP", function (done) {
    var options = {
      host: 'localhost',
      port: '8081',
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

    https.request(options, callback).end();
  });

  xit("should create a test error", function (done) {
    var options = {
      host: 'localhost',
      port: '8081',
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

    https.request(options, callback).end();
  });
});