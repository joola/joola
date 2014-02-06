describe("query-nested", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = global.uid;
    this.collection = 'test-collection-nested-' + this.uid;
    done();
  });

  it("should perform a nested query", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: ['value.actual']
    };
    joola.query.fetch(this.context, query, function (err, result) {
      //console.log(result);
      //console.log(result.documents[0].values);
      //if (!result.documents[0].values.value)
      //  return done(new Error('Failed [null]'));

      //expect(result.documents[0].values.value).to.equal(3);
      done(err);
    });
  });
});