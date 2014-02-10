var domain = require('domain');

describe("query-basic", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = global.uid;
    this.collection = 'test-collection-basic-' + this.uid;
    done();
  });

  var d;
  var uncaughtExceptionHandler;

  beforeEach(function () {
    d = domain.create();
    uncaughtExceptionHandler = _.last(process.listeners("uncaughtException"));
    process.removeListener("uncaughtException", uncaughtExceptionHandler);
  });

  afterEach(function () {
    d.dispose();
    process.on("uncaughtException", uncaughtExceptionHandler);
  });

  it("should not fail performing a query with no arguments", function (done) {
    var query = {};
    var expected = 0;

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;
      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a basic query with minimal arguments", function (done) {
    var query = {
      metrics: ['value']
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.value).to.equal(3);
      return done();
    });
  });

  it("should perform a basic query", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: ['value']
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.value).to.equal(3);
      return done();
    });
  });

  it("should perform a freestyle query [avg]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'value', dependsOn: 'value', aggregation: 'avg'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.value).to.equal(1.5);
      return done();
    });
  });
});