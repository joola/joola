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

  it("should report total usage", function (done) {
    joolaio.system.usage(function (err, usage) {
      expect(usage).to.be.ok;
      expect(usage.resultCount).to.be.ok;
      expect(usage.documents).to.be.ok;
      expect(usage.resultCount).to.be.greaterThan(0);
      done();
    });
  });
});
