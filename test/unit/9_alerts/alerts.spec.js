describe("alerts", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = joola.common.uuid();
    done();
  });

  it("should send an alert", function (done) {
    var id = 'test-alert';
    var query = {
      timeframe: 'last_minute',
      interval: 'second',
      metrics: ['event']
    };
    var type = 'webhook';
    var endpoint = '/nowehere';

    joola.alerts.set(this.context, query, type, endpoint, function (err) {
      if (err)
        return done(err);

      done();
    });
  });

  it("should send an alert w/ route", function (done) {
    var id = 'test-alert';
    var query = {
      timeframe: 'last_minute',
      interval: 'second',
      metrics: ['event']
    };
    var type = 'webhook';
    var endpoint = '/nowehere';

    joolaio.alerts.set(this.context, id, query, type, endpoint, function (err) {
      if (err)
        return done(err);

      done();
    });
  });
});