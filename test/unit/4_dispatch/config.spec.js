describe("config", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    return done();
  });

  it("should set a config value", function (done) {
    engine.dispatch.config.set(this.context, 'test-config-' + this.uid, 'test', function (err) {
      if (err)
        return done(err);
      return done();
    });
  });

  it("should get config value", function (done) {
    engine.dispatch.config.get(this.context, 'test-config-' + this.uid, function (err, value) {
      if (err)
        return done(err);

      expect(value.value).to.equal('test');
      return done();
    });
  });

  it("should get all config", function (done) {
    engine.dispatch.config.get(this.context, '*', function (err, config) {
      if (err)
        return done(err);

      expect(config.version).to.be.ok;
      return done();
    });
  });
});