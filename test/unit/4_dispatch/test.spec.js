describe("test", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    done();
  });

  it("should have valid route [with permission]", function (done) {
    var io = require('socket.io-browserify');
    io.socket = joola.io.connect(joola.options.host);
    io.socket.once('/test/withpermission:done', function (_message) {
      if (_message.headers.StatusCode === 500)
        return done(new Error('Failed'));

      return done();
    });
    var options =
    {
      APIToken: 'apitoken-test',
      _path: 'test/withpermission'
    };
    io.socket.emit('/test/withpermission', options);
  });

  it("should validate route [with permission]", function (done) {
    engine.test.withpermission(this.context, function (err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      done();
    });
  });


  it("should have valid route [with no permission]", function (done) {
    var io = require('socket.io-browserify');
    io.socket = joola.io.connect(joola.options.host);
    io.socket.once('/test/nopermission:done', function (_message) {
      if (_message.headers.StatusCode === 500)
        return done(new Error('Failed'));

      return done();
    });
    var options =
    {
      APIToken: 'apitoken-test',
      _path: 'test/nopermission'
    };
    io.socket.emit('/test/nopermission', options);
  });

  it("should validate route [with no permission]", function (done) {
    engine.test.nopermission(this.context, function (err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      done();
    });
  });


  it("should have valid route [expcetion]", function (done) {
    var io = require('socket.io-browserify');
    io.socket = joola.io.connect(joola.options.host);
    io.socket.once('/test/createtesterror:done', function (_message) {
      if (_message.headers.StatusCode === 500)
        return done(new Error('Failed'));

      return done();
    });
    var options =
    {
      APIToken: 'apitoken-test',
      _path: 'test/createtesterror'
    };
    io.socket.emit('/test/createtesterror', options);
  });

  it("shoud validate route [expcetion]", function (done) {
    engine.test.createtesterror(this.context, function (err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      done();
    });
  });
});