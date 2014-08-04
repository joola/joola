describe("alerts", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    done();
  });

  xit("should send an alert w/ route", function (done) {
    var id = 'test-alert';
    var query = {
      timeframe: 'last_minute',
      interval: 'second',
      metrics: ['event'],
      collection:'usage-'
    };
    var type = 'webhook';
    var endpoint = '/nowehere';

    engine.alerts.set(this.context, id, query, type, endpoint, function (err) {
      if (err)
        return done(err);

      setTimeout(done, 2000);
    });
  });
});