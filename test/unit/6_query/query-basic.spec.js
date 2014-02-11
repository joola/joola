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

  xit("should not fail performing a query with no arguments", function (done) {
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
      metrics: ['value', 'another']
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.value).to.equal(3);
      return done();
    });
  });

  it("should perform a basic query with minimal arguments [no timestamp]", function (done) {
    var query = {
      metrics: ['visitors']
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.visitors).to.equal(2);
      return done();
    });
  });
  
  it("should perform a basic query", function (done) {
    var query = {
      timeframe: 'this_day',
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

  it("should perform a basic timeline query", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value']
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents.length).to.equal(1440);
      return done();
    });
  });

  it("should perform a freestyle query [avg]", function (done) {
    var query = {
      timeframe: 'this_day',
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

  it("should perform a freestyle query with specific collection [avg]", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'value', dependsOn: 'value', aggregation: 'avg', collection: this.collection}
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
      timeframe: 'this_day',
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
      timeframe: 'this_day',
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
      timeframe: 'this_day',
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
      timeframe: 'this_day',
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
      timeframe: 'this_day',
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
      timeframe: 'this_day',
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

  it("should perform a freestyle query [decmials=4]", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'value', dependsOn: 'value', aggregation: 'avg', decimals: 4}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].fvalues.value).to.equal('1.5000');
      return done();
    });
  });

  it("should perform a freestyle query [decmials=2]", function (done) {
    var query = {
      timeframe: 'this_day',
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
      timeframe: 'this_day',
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

  it("should perform a freestyle query [timestamp]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [
        {key: 'timestamp', name: 'Timestamp', dependsOn: 'timestamp'}
      ],
      metrics: [
        {key: 'value', name: 'value', dependsOn: 'value', aggregation: 'avg', decimals: 0}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents.length).to.equal(1440);
      return done();
    });
  });

  it("should perform a freestyle formula query [two metrics]", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {
          key: 'calcvalue',
          name: 'calcvalue',
          formula: {
            dependsOn: ['another', 'value'],
            run: 'function(another, value){return another * value;}'
          }
        }
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.calcvalue).to.equal(90);
      return done();
    });
  });


  it("should perform a freestyle formula query [three metrics]", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {
          key: 'calcvalue',
          name: 'calcvalue',
          formula: {
            dependsOn: ['another', 'value', 'third'],
            run: 'function(another, value, third){return another * value * third;}'
          }
        }
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.calcvalue).to.equal(27000);
      return done();
    });
  });

  it("should perform a freestyle formula query [metric and fixed]", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {
          key: 'calcvalue',
          name: 'calcvalue',
          formula: {
            dependsOn: ['another'],
            run: 'function(another){return another * 100;}'
          }
        }
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.calcvalue).to.equal(3000);
      return done();
    });
  });

  it("should perform a freestyle unique count", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {
          key: 'uniquevalue',
          name: 'uniquevalue',
          aggregation: 'ucount',
          datatype: 'number',
          dependsOn: ['attribute']
        }
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].values.uniquevalue).to.equal(1);
      return done();
    });
  });

  it("should perform a freestyle metric transform", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {
          key: 'uniquevalue',
          name: 'uniquevalue',
          aggregation: 'ucount',
          datatype: 'number',
          dependsOn: ['attribute'],
          transform: 'function(value){return value*100;}'
        }
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].fvalues.uniquevalue).to.equal(100);
      return done();
    });
  });

  it("should perform a freestyle dimension transform", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [
        {
          key: 'attribute',
          name: 'attribute',
          datatype: 'string',
          transform: 'function(value){return "transformed-" + value;}'
        }
      ],
      metrics: ['value', 'another']
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents[0].fvalues.attribute).to.equal('transformed-' + 'test');
      return done();
    });
  });

  it("should perform a freestyle avg. per second", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: [
        {
          key: 'persecond',
          name: 'persecond',
          aggregation: 'ucount',
          datatype: 'number',
          dependsOn: ['attribute'],
          transform: 'function(value){return value/60;}'
        }
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents.length).to.equal(1440);
      return done();
    });
  });
  
  
});