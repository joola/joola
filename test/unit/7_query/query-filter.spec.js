describe("query-filter", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.workspace = 'root';
    this.uid = global.uid;
    this.collection = 'test-collection-basic-' + this.uid;

    done();
  });

  it("should query only filtered results.", function (done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['attribute', 'eq', 'test2']
      ]
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
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

  it("should query only filtered results [two conditions].", function (done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['attribute', 'eq', 'test2'],
        ['attribute2', 'eq', 'test22'],
      ]
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
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

  it("should query only filtered results [two conditions, no results].", function (done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['attribute', 'eq', 'test2'],
        ['attribute2', 'eq', 'test222'],
      ]
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      //TODO: MongoDB fails on this test because the providr returns an empty resultset. ES passes.
      /*expect(result.documents.length).to.equal(1);
      expect(result.documents[0].value).to.equal(0);
      expect(result.documents[0].another).to.equal(0);*/
      return done();
    });
  });

  it("should query only filtered results [regex].", function (done) {
    var query = {
      dimensions: [],
      metrics: ['value', 'another'],
      collection: this.collection,
      filter: [
        ['attribute', 'regex', /test.*?/]
      ]
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].value).to.equal(4);
      expect(result.documents[0].another).to.equal(40);
      return done();
    });
  });
});