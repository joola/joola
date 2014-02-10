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

  it("should perform a freestyle query [min]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'value', dependsOn: 'value', aggregation: 'min'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.value).to.equal(1);
      return done();
    });
  });

  it("should perform a freestyle query [max]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'value', dependsOn: 'value', aggregation: 'max'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.value).to.equal(2);
      return done();
    });
  });
  
  it("should perform a freestyle query [name]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'Value', dependsOn: 'value', aggregation: 'avg'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.metrics[0].name).to.equal('Value');
      return done();
    });
  });

  it("should perform a freestyle query [prefix]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'value', dependsOn: 'value', prefix: '$'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].fvalues.value).to.equal('$3');
      return done();
    });
  });

  it("should perform a freestyle query [suffix]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'value', dependsOn: 'value', suffix: 'ms'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].fvalues.value).to.equal('3ms');
      return done();
    });
  });

  it("should perform a freestyle query [prefix+suffix]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'value', dependsOn: 'value', prefix: '$', suffix: 'ms'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].fvalues.value).to.equal('$3ms');
      return done();
    });
  });

 it("should perform a freestyle query [decmials=2]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'value', dependsOn: 'value', aggregation: 'avg', decimals: 2}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].fvalues.value).to.equal('1.50');
      return done();
    });
  });

 it("should perform a freestyle query [decmials=0]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'value', dependsOn: 'value', aggregation: 'avg', decimals: 0}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].fvalues.value).to.equal('2');
      return done();
    });
  });
});