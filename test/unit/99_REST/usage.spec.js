describe("collections", function () {
  before(function (done) {
    this.context = {user: joolaio.USER};
    this.collection = 'test-collection-dispatch-' + global.uid;

    //done();
    joolaio.set('APIToken', 'apitoken-demo', done);
  });

  after(function (done) {
    //joolaio.set('APIToken', 'apitoken-test', done);
    done();
  });

  it("should report total usage for system", function (done) {
    joolaio.system.usage(null, null, null, function (err, usage) {
      if (err)
        return done(err);

      expect(usage).to.be.ok;
      expect(usage.resultCount).to.be.ok;
      expect(usage.documents).to.be.ok;
      expect(usage.resultCount).to.be.greaterThan(0);
      done();
    });
  });

  it("should report total usage for workspace", function (done) {
    joolaio.system.usage('demo', null, null, function (err, usage) {
      if (err)
        return done(err);

      console.log(err, usage);
      expect(usage).to.be.ok;
      expect(usage.resultCount).to.be.ok;
      expect(usage.documents).to.be.ok;
      expect(usage.resultCount).to.be.greaterThan(0);
      done();
    });
  });

  it("should report total usage for workspace/user", function (done) {
    joolaio.system.usage('demo', 'reader', null, function (err, usage) {
      if (err)
        return done(err);

      console.log(err, usage);
      expect(usage).to.be.ok;
      expect(usage.resultCount).to.be.ok;
      expect(usage.documents).to.be.ok;
      expect(usage.resultCount).to.be.greaterThan(0);
      done();
    });
  });

  it("should report total usage for workspace/user/collection", function (done) {
    joolaio.system.usage('demo', 'reader', 'demo-visits', function (err, usage) {
      if (err)
        return done(err);

      console.log(err, usage);
      expect(usage).to.be.ok;
      expect(usage.resultCount).to.be.ok;
      expect(usage.documents).to.be.ok;
      expect(usage.resultCount).to.be.greaterThan(0);
      done();
    });
  });
});
