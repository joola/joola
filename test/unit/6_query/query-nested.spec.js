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

  it("should perform a freestyle query [dimension]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: ['user.username', 'nattribute' ],
      metrics: [
        {key: 'actual', name: 'value', dependsOn: 'nvalue.actual', aggregation: 'avg'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      console.log(require('util').inspect(result, {depth:null}));


      expect(result.documents.length).to.equal(2);
      return done();
    });
  });

  it("should perform a freestyle query [dimension+adhoc]", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: ['user.username', {key: 'nattribute', name: 'attribute'} ],
      metrics: [
        {key: 'actual', name: 'value', dependsOn: 'nvalue.actual', aggregation: 'avg'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents.length).to.equal(2);
      return done();
    });
  });

  it("should perform a freestyle query [adhoc+adhoc]", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [
        {key: 'user.username'},
        {key: 'nattribute', name: 'nattribute'}
      ],
      metrics: [
        {key: 'actual', name: 'value', dependsOn: 'nvalue.actual', aggregation: 'avg'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents.length).to.equal(2);
      return done();
    });
  });

  it("should perform a freestyle query [adhoc w/ collection]", function (done) {
    var query = {
      timeframe: 'this_day',
      interval: 'minute',
      dimensions: [
        {key: 'user.username', collection: this.collection},
        {key: 'nattribute', name: 'attribute'}
      ],
      metrics: [
        {key: 'actual', name: 'value', dependsOn: 'nvalue.actual', aggregation: 'avg'}
      ]
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result.documents.length).to.equal(2);
      return done();
    });
  });
});