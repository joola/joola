var
  path = require('path'),
  exec = require('child_process').exec;

describe("grid", function () {
  var app;
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = joola.common.uuid();
    this.organization = _token.user.organization;
    return done();
  });

  it("should start an additional node", function (done) {
    var spawn = require('child_process').spawn;
    var binPath = path.join(__dirname, '../../../', 'joola.io.js');
    app = spawn('node', [binPath, '--nolog']);

    joola.dispatch.on('nodes:state:change', function (channel, message) {
      if (message[1].status === 'online')
        done();
    });

    app.on('close', function (code) {
      done(new Error('Failed to init new joola.io'));
    });
  });

  it("should handle dispatch messages on a secondary node", function (done) {
    joola.dispatch.request(_token._, 'organizations:list', {}, function (err, result, message) {
      if (message.from !== message['fulfilled-by'])
        done();
      else
        done(new Error('Failed to rely dispatch messages to secondary node'));
    })
  });

  after(function (done) {
    app.kill(0);
    done();
  });
});