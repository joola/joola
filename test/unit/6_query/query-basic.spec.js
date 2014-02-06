describe("query-basic", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = global.uid;
    this.collection = 'test-collection-basic-' + this.uid;
    done();
  });

  it("should perform a basic query", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: ['value']
    };
    joola.query.fetch(this.context, query, function (err, result) {
      //console.log(err, result);
      //if (!result.documents[0].values.value)
      //  return done(new Error('Failed [null]'));

      //expect(result.documents[0].values.value).to.equal(3);
      done(err);
    });
  });
});