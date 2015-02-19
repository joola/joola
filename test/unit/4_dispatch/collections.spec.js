describe("collections", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.collection = 'test-collection-collectionstest-' + global.uid;

    return done();
  });

  it("should return a valid list of collections", function (done) {
    joola_proxy.dispatch.collections.list(this.context, this.context.user.workspace, function (err, collections) {
      if (err)
        return done(err);

      expect(collections).to.be.ok;
      return done();
    });
  });

  it("should add a collection", function (done) {
    var collection = {
      key: this.collection,
      name: this.collection
    };
    joola_proxy.dispatch.collections.add(this.context, this.context.user.workspace, collection, function (err, collection) {
      if (err)
        return done(err);

      expect(collection).to.be.ok;
      return done();
    });
  });

  it("should fail adding an existing collection", function (done) {
    var collection = {
      key: this.collection,
      name: this.collection
    };
    joola_proxy.dispatch.collections.add(this.context, this.context.user.workspace, collection, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail adding collection with incomplete details", function (done) {
    var collection = {

    };
    joola_proxy.dispatch.collections.add(this.context, this.context.user.workspace, collection, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should update a collection", function (done) {
    var collection = {
      key: this.collection,
      name: this.collection,
      test: 1
    };
    joola_proxy.dispatch.collections.patch(this.context, this.context.user.workspace, collection.key, collection, function (err, _collection) {
      if (err)
        return done(err);

      expect(_collection.test).to.equal(1);
      return done();
    });
  });

  it("should fail updating non existing collection", function (done) {
    var collection = {
      key: this.collection + '1',
      name: this.collection
    };
    joola_proxy.dispatch.collections.patch(this.context, this.context.user.workspace, collection.key, collection, function (err, _collection) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should get a collection", function (done) {
    var self = this;
    joola_proxy.dispatch.collections.get(this.context, this.context.user.workspace, this.collection, function (err, collection) {
      if (err)
        return done(err);

      expect(collection).to.be.ok;
      expect(collection.key).to.equal(self.collection);
      return done();
    });
  });

  it("should get collection stats", function (done) {
    var self=this;
    joola_proxy.beacon.insert(this.context, this.context.user.workspace, this.collection, {timestamp: null, test: 1}, function (err) {
      if (err)
        return done(err);

      joola_proxy.dispatch.collections.stats(self.context, self.context.user.workspace, self.collection, function (err, stats) {
        if (err)
          return done(err);
        expect(stats).to.be.ok;
        done();
      });
    });
  });

  it("should fail getting stats for non-existing collection", function (done) {
    joola_proxy.dispatch.collections.stats(this.context, this.context.user.workspace, this.collection + '1', function (err) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });

  it("should get a collection meta data", function (done) {
    var self = this;
    var document = require('../../fixtures/basic.json')[0];
    joola_proxy.dispatch.collections.metadata(self.context, self.context.user.workspace, self.collection, document, function (err, meta) {
      if (err)
        return done(err);

      expect(meta).to.be.ok;
      done();
    });
  });

  it("should delete a collection", function (done) {
    var self = this;
    joola_proxy.dispatch.collections.delete(this.context, this.context.user.workspace, this.collection, function (err) {
      if (err)
        return done(err);

      joola_proxy.dispatch.collections.get(self.context, self.context.user.workspace, self.collection, function (err, collections) {
        if (err)
          return done();

        done(new Error('This should fail'));
      });
    });
  });

  it("should fail deleting a non-existing collection", function (done) {
    joola_proxy.dispatch.collections.delete(this.context, this.context.user.workspace, this.collection, function (err) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });
});
