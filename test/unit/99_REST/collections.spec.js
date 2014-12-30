describe("collections", function () {
  before(function (done) {
    this.context = {user: joola.USER};
    this.collection = 'test-collection-dispatch-' + global.uid;

    joola.set('APIToken', 'apitoken-demo', done);
  });

  after(function (done) {
    joola.set('APIToken', 'apitoken-demo', done);
  });

  it("should return a valid list of collections", function (done) {
    console.log(joola.USER);

    joola.collections.list(this.context.user.workspace, function (err, collections) {
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
    joola.dispatch.collections.add(this.context.user.workspace, collection, function (err, collection) {
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
    joola.dispatch.collections.add(this.context.user.workspace, collection, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail adding collection with incomplete details", function (done) {
    var collection = {

    };
    joola.dispatch.collections.add(this.context.user.workspace, collection, function (err) {
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
    joola.dispatch.collections.patch(this.context.user.workspace, collection.key, collection, function (err, _collection) {
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
    joola.dispatch.collections.patch(this.context.user.workspace, collection.key, collection, function (err, _collection) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should get a collection", function (done) {
    var self = this;
    joola.dispatch.collections.get(this.context.user.workspace, this.collection, function (err, collection) {
      if (err)
        return done(err);

      expect(collection).to.be.ok;
      expect(collection.key).to.equal(self.collection);
      return done();
    });
  });

  xit("should get collection stats", function (done) {
    var self = this;

    joola.beacon.insert(this.context.user.workspace, this.collection, {timestamp: null, test: 1}, function (err) {
      if (err)
        return done(err);
      joola.dispatch.collections.stats(self.context.user.workspace, self.collection, function (err, stats) {
        if (err)
          return done(err);
        expect(stats).to.be.ok;
        done();
      });
    });
  });

  it("should fail getting stats for non-existing collection", function (done) {
    joola.dispatch.collections.stats(this.context.user.workspace, this.collection + '1', function (err) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });

  xit("should get collection min date", function (done) {
    var self = this;
    joola.beacon.insert(this.context.user.workspace, this.collection, {timestamp: null}, function (err) {
      if (err)
        return done(err);
      joola.dispatch.collections.mindate(self.context.user.workspace, self.collection, null, function (err, mindate) {
        if (err)
          return done(err);

        expect(joola.common.typeof(mindate)).to.equal('date');
        done();
      });
    });
  });

  xit("should fail getting non-existing collection min date", function (done) {
    joola.dispatch.collections.mindate(this.context.user.workspace, this.collection + '3', null, function (err) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });

  xit("should get collection max date", function (done) {
    var self = this;
    joola.beacon.insert(this.context.user.workspace, this.collection, {timestamp: null}, function (err) {
      if (err)
        return done(err);
      joola.dispatch.collections.maxdate(self.context.user.workspace, self.collection, null, function (err, maxdate) {
        if (err)
          return done(err);

        expect(joola.common.typeof(maxdate)).to.equal('date');
        done();
      });
    });
  });

  xit("should fail getting non-existing collection max date", function (done) {
    joola.dispatch.collections.maxdate(this.context.user.workspace, this.collection + '3', null, function (err) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });

  it("should get a collection meta data", function (done) {
    var self = this;
    var document = require('../../fixtures/basic.json')[0];
    joola.dispatch.collections.metadata(self.context.user.workspace, self.collection, document, function (err, meta) {
      if (err)
        return done(err);

      expect(meta).to.be.ok;
      done();
    });
  });

  it("should get a collection meta data with no document", function (done) {
    var self = this;
    var document = require('../../fixtures/basic.json')[0];
    joola.dispatch.collections.metadata(self.context.user.workspace, self.collection, {}, function (err, meta) {
      if (err)
        return done(err);

      expect(meta).to.be.ok;
      done();
    });
  });

  xit("should delete a collection", function (done) {
    var self = this;
    joola.dispatch.collections.delete(this.context.user.workspace, this.collection, function (err) {
      if (err)
        return done(err);

      joola.dispatch.collections.get(self.context.user.workspace, self.collection, function (err, collections) {
        if (err)
          return done();

        done(new Error('This should fail'));
      });
    });
  });

  xit("should fail deleting a non-existing collection", function (done) {
    joola.dispatch.collections.delete(this.context.user.workspace, this.collection, function (err) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });
}); 