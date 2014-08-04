describe("query-basic", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.workspace = 'root';
    this.uid = global.uid;
    this.collection = 'test-collection-basic-' + this.uid;

    done();
  });

  it("should not fail performing a query with no arguments", function (done) {
    var query = {};
    var expected = 0;

    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      var actual = result.documents.length;
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(actual).to.equal(expected);
      return done();
    });
  });

  it("should perform a basic query with minimal arguments", function (done) {
    var query = {
      metrics: ['value', 'another'],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.value).to.equal(4);
      return done();
    });
  });

  it("should perform a basic query with minimal arguments [no timestamp]", function (done) {
    var query = {
      timeframe: 'last_minute',
      interval: 'raw',
      metrics: ['value'],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.value).to.equal(4);
      return done();
    });
  });

  it("should perform a basic query", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: ['value'],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.value).to.equal(4);
      return done();
    });
  });

  it("should perform a basic timeline query", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['value'],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents.length).to.equal(1441);
      return done();
    });
  });

  it("should perform a freestyle query [without dependsOn]", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'value', name: 'value', aggregation: 'avg'}
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.value).to.equal(1.33);
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.value).to.equal(1.33);
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.value).to.equal(1.33);
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].fvalues.value).to.equal('$4');
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].fvalues.value).to.equal('4ms');
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].fvalues.value).to.equal('$4ms');
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].fvalues.value).to.equal('1.3333');
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].fvalues.value).to.equal('1.33');
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].fvalues.value).to.equal('1');
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents.length).to.equal(1441);
      return done();
    });
  });

  xit("should perform a freestyle formula query [two metrics]", function (done) {
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.calcvalue).to.equal(250);
      return done();
    });
  });


  xit("should perform a freestyle formula query [three metrics]", function (done) {
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.calcvalue).to.equal(125000);
      return done();
    });
  });

  xit("should perform a freestyle formula query [metric and fixed]", function (done) {
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.calcvalue).to.equal(5000);
      return done();
    });
  });

  xit("should perform a freestyle unique count", function (done) {
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.uniquevalue).to.equal(1);
      return done();
    });
  });

  xit("should perform a freestyle metric transform", function (done) {
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
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
      metrics: ['value', 'another'],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
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
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents.length).to.equal(1441);
      return done();
    });
  });
});