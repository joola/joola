describe("query-basic", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.workspace = 'root';
    this.uid = global.uid;
    this.collection = 'test-collection-basic-' + this.uid;

    done();
  });


  it("should perform an last_n_items query w/o metrics", function (done) {
    var query = {
      timeframe: 'last_1_items',
      interval: 'minute',
      dimensions: ['attribute'],
      metrics: [

      ],
      collection: this.collection
    };
    joola_proxy.query.fetch(this.context, query, function (err, result) {
      if (err)
        return done(err);
      
      expect(result).to.be.ok;
      expect(result.documents).to.be.ok;
      expect(result.documents.length).to.be.greaterThan(0);
      expect(result.documents[0].values.attribute).to.equal('test');
      return done();
    });
  });
});