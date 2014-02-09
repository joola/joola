describe("beacon-basic", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = global.uid;
    this.collection = 'test-collection-basic-' + this.uid;

    done();
  });

  it("should load a single document", function (done) {
    var documents = require('../../fixtures/basic.json');
    joola.beacon.insert(this.context, this.collection, documents[0], function (err) {
      done(err);
    });
  });

  it("should failing loading a duplicate single document", function (done) {
    var documents = require('../../fixtures/basic.json');
    joola.beacon.insert(this.context, this.collection, documents[0], function (err, documents) {
      expect(documents[0].saved).to.equal(false);
      done();
    });
  });

  it("should load array of documents", function (done) {
    var documents = require('../../fixtures/basic.json');
    joola.beacon.insert(this.context, this.collection, documents, function (err) {
      done(err);
    });
  });
});