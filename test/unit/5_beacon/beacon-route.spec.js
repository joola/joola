describe("beacon-route", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = global.uid;
    this.collection = 'test-collection-basic-' + this.uid;

    done();
  });

  it("should have valid route [object]", function (done) {
    var io = require('socket.io-browserify');
    io.socket = joolaio.io.connect(joolaio.options.host);
    io.socket.once('/beacon/insert:done', function (_message) {
      //TODO: confirm document is actually written
      if (_message.code === 500)
        return done(new Error('Failed'));

      return done();
    });
    var options =
    {
      APIToken: '7890',
      _path: '/beacon/insert',
      collection: 'test-beacon-route-' +  this.uid,
      document: {
        attribute: 'attribute',
        value: 123
      }
    };
    io.socket.emit('/beacon/insert', options);
  });

  it("should have valid route [invalid string] with error", function (done) {
    var io = require('socket.io-browserify');
    io.socket = joolaio.io.connect(joolaio.options.host);
    io.socket.once('/beacon/insert:done', function (_message) {
      if (_message.code === 500)
        return done();

      return done(new Error('Failed'));
    });
    var options =
    {
      APIToken: '7890',
      _path: '/beacon/insert',
      collection: 'test-beacon-route-' +  this.uid,
      document: 'invalid json'
    };
    io.socket.emit('/beacon/insert', options);
  });

  it("should have valid route [string]", function (done) {
    var io = require('socket.io-browserify');
    io.socket = joolaio.io.connect(joolaio.options.host);
    io.socket.once('/beacon/insert:done', function (_message) {
      //TODO: confirm document is actually written
      if (_message.code === 500)
        return done(new Error('Failed'));

      return done();
    });
    var options =
    {
      APIToken: '7890',
      _path: '/beacon/insert',
      collection: 'test-beacon-route-' + this.uid,
      document: JSON.stringify({document: {
        attribute: 'attribute1',
        value: 1234
      }})
    };
    io.socket.emit('/beacon/insert', options);
  });
});