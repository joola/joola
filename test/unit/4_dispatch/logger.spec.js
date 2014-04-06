describe("logger", function () {
  before(function (done) {
    this.context = {user: _token.user};
    return done();
  });

  xit("should return an array of logged items", function (done) {
    joola.dispatch.logger.fetch(this.context, function (err, logs) {
      if (err)
        return done(err);

      expect(logs.length).to.be.greaterThan(0);
      return done();
    });
  });

  xit("should return an array of logged items from timestamp", function (done) {
    var start_ts = new Date();
    start_ts.setMinutes(start_ts.getMinutes() - 1);
    joola.dispatch.logger.fetchSince(this.context, start_ts, function (err, logs) {
      if (err)
        return done(err);

      expect(logs.length).to.be.greaterThan(0);
      return done();
    });
  });

  xit("should return an array of logged items until timestamp", function (done) {
    var end_ts = new Date();
    joola.dispatch.logger.fetchUntil(this.context, end_ts, function (err, logs) {
      if (err)
        return done(err);

      expect(logs.length).to.be.greaterThan(0);
      return done();
    });
  });
});