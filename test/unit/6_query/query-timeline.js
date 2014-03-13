var domain = require('domain');

describe("query-timeline", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = global.uid;
    this.collection = 'test-collection-basic-' + this.uid;
    done();
  });

  it("should perform a timeline query [this_second/second]", function (done) {
    var expected = 1;
    var query = {
      timeframe: 'this_second',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [last_second/second]", function (done) {
    var expected = 2;
    var query = {
      timeframe: 'last_second',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [this_second/minute]", function (done) {
    var expected = 1;
    var query = {
      timeframe: 'this_second',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [last_second/minute]", function (done) {
    var expected = 1;
    var query = {
      timeframe: 'last_second',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [this_n_seconds/second]", function (done) {
    var expected = 17;
    var query = {
      timeframe: 'this_17_seconds',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [last_n_seconds/second]", function (done) {
    var expected = 18;
    var query = {
      timeframe: 'last_17_seconds',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [this_minute/second]", function (done) {

    var expected = 60;
    var query = {
      timeframe: 'this_minute',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    var _date = new Date();
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      if (actual === _date.getSeconds() || actual === _date.getSeconds() + 1)
        return done();

      return done('Failed, expected [' + expected + '], actual [' + actual + ']');
    });
  });

  it("should perform a timeline query [last_minute/second]", function (done) {
    var expected = 61;
    var query = {
      timeframe: 'last_minute',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [this_minute/minute]", function (done) {
    var expected = 1;
    var query = {
      timeframe: 'this_minute',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
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
    var expected = 2;
    var query = {
      timeframe: 'last_minute',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [this_n_minutes/minute]", function (done) {
    var expected = 17;
    var query = {
      timeframe: 'this_17_minutes',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [last_n_minutes/minute]", function (done) {
    var expected = 18;
    var query = {
      timeframe: 'last_17_minutes',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [this_hour/minute]", function (done) {
    var expected = 60;
    var query = {
      timeframe: 'this_hour',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    var _date = new Date();
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      if (actual === _date.getMinutes() || actual === _date.getMinutes() + 1)
        return done();

      return done('Failed, expected [' + expected + '], actual [' + actual + ']');
    });
  });

  it("should perform a timeline query [last_hour/minute]", function (done) {
    var expected = 61;
    var query = {
      timeframe: 'last_hour',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [this_n_hour/minute]", function (done) {
    var expected = 3;
    var query = {
      timeframe: 'this_3_hour',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    var _date = new Date();
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      if (actual === 120 + _date.getMinutes() || actual === 120 + _date.getMinutes() + 1)
        return done();

      return done('Failed, expected [' + expected + '], actual [' + actual + ']');
    });
  });

  it("should perform a timeline query [last_n_hour/minute]", function (done) {
    var expected = 181;
    var query = {
      timeframe: 'last_3_hour',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [this_day/hour]", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'hour',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      var expected = new Date().getHours();
      if (actual === expected || actual === expected + 1)
        return done();

      return done('Failed, expected [' + expected + '], actual [' + actual + ']');
    });
  });

  it("should perform a timeline query [last_day/second]", function (done) {
    var expected = 86401;
    var query = {
      timeframe: 'last_day',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['value']
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
    var expected = 1441;
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
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
    var expected = 25;
    var query = {
      timeframe: 'last_day',
      interval: 'hour',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [last_day/day]", function (done) {
    var expected = 2;
    var query = {
      timeframe: 'last_day',
      interval: 'day',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query [last_7_days/day]", function (done) {
    var expected = 8;
    var query = {
      timeframe: 'last_7_days',
      interval: 'day',
      dimensions: ['timestamp'],
      metrics: ['value']
    };

    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;

      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a timeline query with start and end", function (done) {
    var expected = 31;

    var _startdate = new Date(2014, 0, 1);
    var _enddate = new Date(2014, 0, 31, 23, 59, 59, 999);

    var query = {
      timeframe: {
        start: _startdate,
        end: _enddate
      },
      interval: 'day',
      dimensions: ['timestamp'],
      metrics: ['value']
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