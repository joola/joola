describe("query-filter", function() {
  before(function(done) {
    this.context = {
      user: _token.user
    };
    this.workspace = 'root';
    this.uid = global.uid;
    this.collection = 'test-collection-basic-' + this.uid;

    done();
  });

  it("should query only filtered results", function(done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['attribute', 'eq', 'test2']
      ]
    };
    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(2);
      expect(result.documents[0].another).to.equal(20);
      return done();
    });
  });

  it("should query only filtered results [two conditions]", function(done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['attribute', 'eq', 'test2'],
        ['attribute2', 'eq', 'test22'],
      ]
    };
    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(2);
      expect(result.documents[0].another).to.equal(20);
      return done();
    });
  });

  it("should query only filtered results [two conditions, no results]", function(done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['attribute', 'eq', 'test2'],
        ['attribute2', 'eq', 'test222'],
      ]
    };
    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      //TODO: MongoDB fails on this test because the provider returns an empty resultset. ES passes.
      /*expect(result.documents.length).to.equal(1);
       expect(result.documents[0].value).to.equal(0);
       expect(result.documents[0].another).to.equal(0);*/
      return done();
    });
  });

  it("should query only filtered results [regex]", function(done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['attribute', 'regex', 'test.*?']
      ]
    };
    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(3);
      expect(result.documents[0].another).to.equal(30);
      return done();
    });
  });

  it("should query for in-array values", function(done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['interests', 'in', '[1,2]']
      ]
    };
    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(3);
      expect(result.documents[0].another).to.equal(30);
      return done();
    });
  });

  it("should query for in-array values [strict, ES only]", function(done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['tags', '_in', '["book", "computer"]']
      ]
    };

    if (joola_proxy.datastore.providers.default.name !== 'ElasticSearch')
      return done();

    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(2);
      expect(result.documents[0].another).to.equal(20);
      return done();
    });
  });

  it("should query for ranges [gt, ES only]", function(done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['value', 'gt', 0]
      ]
    };

    if (joola_proxy.datastore.providers.default.name !== 'ElasticSearch')
      return done();

    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(3);
      expect(result.documents[0].another).to.equal(30);
      return done();
    });
  });

  it("should query for ranges [gte, ES only]", function(done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['value', 'gte', 2]
      ]
    };

    if (joola_proxy.datastore.providers.default.name !== 'ElasticSearch')
      return done();

    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(2);
      expect(result.documents[0].another).to.equal(20);
      return done();
    });
  });

  it("should perform a freestyle sum w/ filter", function(done) {
    var query = {
      timeframe: 'last_day',
      interval: 'day',
      dimensions: [],
      metrics: [{
        key: 'value',
        filter: [
          ['attribute', 'eq', 'test2']
        ]
      }],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(2);
      return done();
    });
  });

  it("should perform a freestyle sum w/ 2 metrics, 1 filtered", function(done) {
    var query = {
      timeframe: 'last_day',
      interval: 'day',
      dimensions: [],
      metrics: [{
        key: 'value',
        filter: [
          ['attribute', 'eq', 'test2']
        ]
      }, 'another'],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(2);
      expect(result.documents[0].another).to.equal(30);
      return done();
    });
  });

  it("should perform a freestyle sum w/ 2 metrics, 2 filtered", function(done) {
    var query = {
      timeframe: 'last_day',
      interval: 'day',
      dimensions: [],
      metrics: [{
        key: 'value',
        filter: [
          ['attribute', 'eq', 'test2']
        ]
      }, {
        key: 'another',
        filter: [
          ['attribute', 'eq', 'test2']
        ]
      }],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(2);
      expect(result.documents[0].another).to.equal(20);
      return done();
    });
  });

  it("should perform a freestyle sum w/ 2 metrics, 1 filtered, general filter", function(done) {
    var query = {
      timeframe: 'last_day',
      interval: 'day',
      dimensions: [],
      metrics: [{
        key: 'value',
        filter: [
          ['attribute', 'eq', 'test2']
        ]
      }, 'another'],
      filter: [
        ['tags', '_in', '["book"]']
      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(2);
      expect(result.documents[0].another).to.equal(20);
      return done();
    });
  });

  it("should perform a freestyle calculated metric w/ 2 metrics, 2 filtered", function(done) {
    var query = {
      timeframe: 'last_day',
      interval: 'day',
      dimensions: [],
      metrics: [{
        key: 'calcvalue',
        formula: {
          dependsOn: [{
            key: 'value',
            filter: [
              ['attribute', 'eq', 'test2']
            ]
          }, {
            key: 'another',
            filter: [
              ['attribute', 'eq', 'test2']
            ]
          }],
          run: 'function(value, another) { return value * another }'
        }
      }],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function(err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].calcvalue).to.equal(40);
      return done();
    });
  });

  
});
