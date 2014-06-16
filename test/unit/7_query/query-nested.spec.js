describe("query-nested", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.workspace = 'root';
    this.uid = global.uid;
    this.collection = 'test-collection-nested-' + this.uid;

    done();
  });

  after(function (done) {
    var self = this;
    joola.collections.delete(this.context, this.workspace, this.collection, function () {
      joola.collections.delete(self.context, self.workspace, self.collection + '-nots', function () {
        done();
      });
    });
  });

  it("should perform a nested query", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: ['nvalue.actual'],
      collection: this.collection
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.nvalue_actual).to.equal(8);
      return done(err);
    });
  });

  it("should perform a freestyle query [avg]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: [],
      metrics: [
        {key: 'actual', name: 'value', dependsOn: 'nvalue.actual', aggregation: 'avg'}
      ],
      collection: this.collection
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.actual).to.equal(2.67);
      return done();
    });
  });

  it("should perform a freestyle query [dimension]", function (done) {
    var query = {
      timeframe: 'last_day',
      interval: 'minute',
      dimensions: ['user.username', 'nattribute' ],
      metrics: [
        {key: 'actual', name: 'value', dependsOn: 'nvalue.actual', aggregation: 'sum'}
      ],
      collection: this.collection
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
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
      ],
      collection: this.collection
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
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
      ],
      collection: this.collection
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
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
      ],
      collection: this.collection
    };
    joola.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents.length).to.equal(2);
      return done();
    });
  });
});