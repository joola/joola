describe("query-nested", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = global.uid;
    this.collection = 'test-collection-nested-' + this.uid;
    done();
  });

  it("should perform a nested query", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [],
      metrics: ['nvalue.actual']
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.actual).to.equal(3);
      return done(err);
    });
  });

  it("should perform a freestyle query [avg]", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'actual', name: 'value', dependsOn: 'nvalue.actual', aggregation: 'avg'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.actual).to.equal(1.5);
      return done();
    });
  });
});