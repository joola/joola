describe("beacon-nested", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = global.uid;
    this.collection = 'test-collection-nested-' + this.uid;
    this.documents = require('../../fixtures/nested.json');
    done();
  });

  it("should load a single document", function (done) {
    var self = this;
    var documents = ce.clone(this.documents)[0];
    joola.beacon.insert(this.context, this.context.user.workspace, this.collection, documents, function (err, doc) {
      self.dup = new Date(doc[0].timestamp).toISOString();
      doc = doc[0];
      expect(doc.saved).to.equal(true);
      done(err);
    });
  });

  it("should fail loading a duplicate single document", function (done) {
    var documents = ce.clone(this.documents)[0];
    documents.timestamp = this.dup;
    joola.beacon.insert(this.context, this.context.user.workspace, this.collection, documents, function (err, doc) {
      doc = doc[0];
      expect(doc.saved).to.equal(false);
      done();
    });
  });

  it("should load array of documents", function (done) {
    var documents = ce.clone(this.documents);
    joola.beacon.insert(this.context, this.context.user.workspace, this.collection, documents, function (err, docs) {
      if (err)
        return done(err);
      docs.forEach(function (doc) {
        expect(doc.saved).to.equal(true);
      });
      done();
    });
  });
});