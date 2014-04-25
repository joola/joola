describe("common-mongo", function () {
  before(function (done) {
    this.store = 'cache';
    this.collection = 'test-' + joola.common.uuid();
    done();
  });

  it("should setup a collection", function (done) {
    joola.mongo.collection(this.store, this.collection, done);
  });

  it("should re-use a collection", function (done) {
    joola.mongo.collection(this.store, this.collection, done);
  });

  it("should re-use a store", function (done) {
    joola.mongo.collection(this.store, this.collection + '1', done);
  });

  it("should fail setup a collection for unknown store", function (done) {
    try {
      joola.mongo.collection(this.store + '1', this.collection, function (err) {
        if (err)
          done();
        else
          done(new Error('This should have failed'));
      });
    }
    catch (ex) {
      return done();
    }
  });

  it("should insert a document", function (done) {
    joola.mongo.insert(this.store, this.collection, {test: 1}, {}, done);
  });

  xit("should fail inserting duplicate document", function (done) {
    joola.mongo.insert(this.store, this.collection, {test: 1}, {}, function (err) {
      if (err)
        done();
      else
        done(new Error('This should have failed'));
    });
  });

  it("should iterate inserts when there is a duplicate", function (done) {
    //verified using istanbul
    joola.mongo.insert(this.store, this.collection, [
      {test: 1}
    ], {}, function (err) {
      if (err)
        return done(err);

      return done();
    });
  });

  it("should update a document", function (done) {
    joola.mongo.update(this.store, this.collection, {test: 1}, {test: 2}, {}, done);
  });

  it("should update a document", function (done) {
    joola.mongo.update(this.store, this.collection, {test: 1}, {test: 2}, {}, done);
  });

  it("should find a document", function (done) {
    joola.mongo.find(this.store, this.collection, {test: 1}, {}, function (err, aaa) {
      done();
    });
  });
});