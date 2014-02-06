describe("common-domain", function () {
  it("throw unhandled exception", function (done) {
    var err = new Error('ERROR');
    err.dummy = true;
    joola.domain.emit('error', err);
    done();
  });

  it("throw unhandled plain error without stack", function (done) {
    var err = {message2: 'Error'};
    err.dummy = true;
    joola.domain.emit('error', err);
    done();
  });
});