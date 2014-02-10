var domain = require('domain');

describe("query-timeline", function () {
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

  it("should perform a timeline query [last_second/second]", function (done) {
    var expected = 1;
    var query = {
      timeframe: 'last_second',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value2']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  xit("should perform a timeline query [last_second/minute]", function (done) {
    var expected = 1;
    var query = {
      timeframe: 'last_second',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value2']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [last_5_seconds/second]", function (done) {
    var expected = 5;
    var query = {
      timeframe: 'last_5_seconds',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value2']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [last_30_seconds/second]", function (done) {
    var expected = 30;
    var query = {
      timeframe: 'last_30_seconds',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value2']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });
  
  it("should perform a timeline query [last_minute/second]", function (done) {
    var expected = 60;
    var query = {
      timeframe: 'last_minute',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value2']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [last_minute/minute]", function (done) {
    var expected = 1;
    var query = {
      timeframe: 'last_minute',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value2']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });
  
  it("should perform a timeline query [last_day/second]", function (done) {
    var expected = 86400;
    var query = {
      timeframe: 'last_day',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value2']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });
  
  it("should perform a timeline query [last_day/minute]", function (done) {
    var expected = 1440;
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value2']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [last_day/hour]", function (done) {
    var expected = 24;
    var query = {
      timeframe: 'last_day',
      interval: 'hour',
      dimensions: ['timestamp'],
      metrics: ['value2']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  xit("should perform a timeline query [last_day/day]", function (done) {
    var expected = 1;
    var query = {
      timeframe: 'last_day',
      interval: 'day',
      dimensions: ['timestamp'],
      metrics: ['value2']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });
});