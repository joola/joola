var
  path = require('path'),
  exec = require('child_process').exec;

describe("grid", function () {
  var app;
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = joola.common.uuid();
    this.workspace = _token.user.workspace;
    return done();
  });

  it("should start an additional node", function (done) {
    var doneCalled = false;
    var spawn = require('child_process').spawn;
    var binPath = path.join(__dirname, '../../../', 'joola.js');
    app = spawn('node', [binPath, '--nolog', '--node']);

    engine.dispatch.on('nodes:state:change', function (channel, message) {
      if (!doneCalled && message[1].status === 'online') {
        doneCalled = true;
        setTimeout(done,1000);
      }
    });
  });

  xit("should handle dispatch messages on a secondary node", function (done) {
    engine.dispatch.request(_token._, 'workspaces:list', {}, function (err, result, message) {
      if (message.from !== message['fulfilled-by'])
        done();
      else
        done(new Error('Failed to rely dispatch messages to secondary node'));
    });
  });

  after(function (done) {
    app.kill('SIGINT');
    app.on('exit', function (code) {
      //allow time for the node to register off
      setTimeout(done, 0);
    });
  });
});