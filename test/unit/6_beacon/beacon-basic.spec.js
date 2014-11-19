describe("beacon-basic", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = global.uid;
    this.collection = 'test-collection-basic-' + this.uid;

    this.documents = require('../../fixtures/basic.json');
    done();
  });

  it("should load a single document", function (done) {
    var self = this;
    engine.beacon.insert(this.context, this.context.user.workspace, this.collection, ce.clone(this.documents[0]), function (err, doc,result) {
      if (err)
        return done(err);

      self.dup = new Date(doc[0].timestamp).toISOString();
      doc = doc[0];
      expect(doc.saved).to.equal(true);
      done(err);
    });
  });

  xit("should fail loading a duplicate single document", function (done) {
    var doc = ce.clone(this.documents[0]);
    doc.timestamp = this.dup;

    engine.beacon.insert(this.context, this.context.user.workspace, this.collection, doc, function (err, doc) {
      doc = doc[0];
      expect(doc.saved).to.equal(false);
      done();
    });
  });

  xit("should not fail loading a duplicate multiple document", function (done) {
    var doc = ce.clone(this.documents[0]);
    doc.timestamp = this.dup;

    engine.beacon.insert(this.context, this.context.user.workspace, this.collection, [doc, doc], function (err, doc) {
      expect(doc.length).to.equal(2);
      doc.forEach(function (d) {
        expect(d.saved).to.equal(false);
      });
      done();
    });
  });

  it("should load array of documents", function (done) {
    var self = this;
    var docs = ce.clone(self.documents);
    engine.beacon.insert(self.context, self.context.user.workspace, self.collection, docs, function (err, docs) {
      if (err)
        return done(err);

      docs.forEach(function (d, index) {
        expect(d.saved).to.equal(true);
      });
      done();
    });
  });

  it("should load array of documents and verify timestamp", function (done) {
    var self = this;
    var docs = require('../../fixtures/basic-timestamps.json');

    engine.beacon.insert(self.context, self.context.user.workspace, self.collection + '-times', docs, function (err, docs) {
      if (err)
        return done(err);

      docs.forEach(function (d, index) {
        expect(d.timestamp === docs[index].timestamp);
        var shorttimestamp = new Date(d.timestamp);
        shorttimestamp.setMilliseconds(0);
        //TODO: should be disabled check when using any store other than mongodb.
        if (engine.datastore.providers.default.name === 'mongodb')
          expect(d.timestamp_timebucket.second.getTime()).to.equal(shorttimestamp.getTime());
        expect(d.saved).to.equal(true);
      });
      done();
    });
  });

  it("should complete loading documents with no dimensions correctly", function (done) {
    var documents = [
      {"visitors": 2},
      {"visitors": 3},
      {"visitors": 4}
    ];
    engine.beacon.insert(this.context, this.context.user.workspace, this.collection + '-nots', documents, function (err, docs) {
      if (err)
        return done(err);

      expect(docs.length).to.equal(3);
      docs.forEach(function (d) {
        expect(d.saved).to.equal(true);
      });

      done();
    });
  });

  it("should complete loading documents with no timestamp", function (done) {
    var documents = [
      {"visitors": 2},
      {"visitors": 3},
      {"visitors": 4}
    ];
    engine.beacon.insert(this.context, this.context.user.workspace, this.collection + '-nots', documents, function (err, docs) {
      if (err)
        return done(err);

      expect(docs.length).to.equal(3);
      docs.forEach(function (d) {
        expect(d.saved).to.equal(true);
        expect(d.timestamp).to.be.ok;
      });

      done();
    });
  });
});