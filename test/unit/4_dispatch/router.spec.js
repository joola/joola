describe("router", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    done();
  });

  it("should create an error object", function (done) {
    var err = new engine.webserver.routes.ErrorTemplate(new Error('test'));
    expect(err).to.be.ok;
    done();
  });

  it("should test local route", function (done) {
    var _prev = joola_proxy.config.get('dispatch:enabled');
    var self = this;
    joola_proxy.config.set('dispatch:enabled', false, function () {
      joola_proxy.system.version(self.context, function (err, version) {
        if (err)
          return done(err);
        joola_proxy.config.set('dispatch:enabled', _prev);
        expect(version).to.be.ok;
        done();
      });
    });
  });
});