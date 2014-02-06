describe("collections", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.collection = 'test-collection-dispatch-' + global.uid;

    return done();
  });

  it("should return a valid list of collections", function (done) {
    joola.dispatch.collections.list(this.context, this.context.user.organization, function (err, collections) {
      if (err)
        return done(err);

      expect(collections).to.be.ok;
      return done();
    });
  });

  it("should add a collection", function (done) {
    var collection = {
      id: this.collection,
      name: this.collection
    };
    joola.dispatch.collections.add(this.context, this.context.user.organization, collection, function (err, collection) {
      if (err)
        return done(err);

      expect(collection).to.be.ok;
      return done();
    });
  });

  it("should fail adding an existing collection", function (done) {
    var collection = {
      id: this.collection,
      name: this.collection
    };
    joola.dispatch.collections.add(this.context, this.context.user.organization, collection, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail adding collection with incomplete details", function (done) {
    var collection = {
      id: this.collection + '1'
    };
    joola.dispatch.collections.add(this.context, this.context.user.organization, collection, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should update a collection", function (done) {
    var collection = {
      id: this.collection,
      name: this.collection,
      test: 1
    };
    joola.dispatch.collections.update(this.context, this.context.user.organization, collection, function (err, _collection) {
      if (err)
        return done(err);

      expect(_collection.test).to.equal(1);
      return done();
    });
  });

  it("should fail updating a collection with incomplete details", function (done) {
    var collection = {
      id: this.collection
    };
    joola.dispatch.collections.update(this.context, this.context.user.organization, collection, function (err, _collection) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail updating non existing collection", function (done) {
    var collection = {
      id: this.collection + '1',
      name: this.collection
    };
    joola.dispatch.collections.update(this.context, this.context.user.organization, collection, function (err, _collection) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should get a collection", function (done) {
    var self = this;
    joola.dispatch.collections.get(this.context, this.context.user.organization, this.collection, function (err, collection) {
      if (err)
        return done(err);

      expect(collection).to.be.ok;
      expect(collection.id).to.equal(self.collection);
      return done();
    });
  });

  it("should get collection stats", function (done) {
    joola.dispatch.collections.stats(this.context, this.context.user.organization, this.collection, function (err, stats) {
      if (err)
        return done(err);
      expect(stats).to.be.ok;
      done();
    });
  });

  it("should fail getting stats for non-existing collection", function (done) {
    joola.dispatch.collections.stats(this.context, this.context.user.organization, this.collection + '1', function (err) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });

  it("should get collection min date", function (done) {
    var self = this;
    joola.beacon.insert(this.context, this.collection, {timestamp: null}, function (err) {
      if (err)
        return done(err);
      joola.dispatch.collections.mindate(self.context, self.context.user.organization, self.collection, null, function (err, mindate) {
        if (err)
          return done(err);

        expect(joola.common.typeof(mindate)).to.equal('date');
        done();
      });
    });
  });

  it("should fail getting non-existing collection min date", function (done) {
    joola.dispatch.collections.mindate(this.context, this.context.user.organization, this.collection + '3', null, function (err) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });
  
  it("should get collection max date", function (done) {
    var self = this;
    joola.beacon.insert(this.context, this.collection, {timestamp: null}, function (err) {
      if (err)
        return done(err);
      joola.dispatch.collections.maxdate(self.context, self.context.user.organization, self.collection, null, function (err,maxdate) {
        if (err)
          return done(err);

        expect(joola.common.typeof(maxdate)).to.equal('date');
        done();
      });
    });
  });

  it("should fail getting non-existing collection max date", function (done) {
    joola.dispatch.collections.maxdate(this.context, this.context.user.organization, this.collection + '3', null, function (err) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });

  it("should delete a collection", function (done) {
    var self = this;
    joola.dispatch.collections.delete(this.context, this.context.user.organization, this.collection, function (err) {
      if (err)
        return done(err);

      joola.dispatch.collections.get(self.context, self.context.user.organization, self.collection, function (err, collections) {
        if (err)
          return done();

        done(new Error('This should fail'));
      });
    });
  });

  it("should fail deleting a non-existing collection", function (done) {
    joola.dispatch.collections.delete(this.context, this.context.user.organization, this.collection, function (err) {
      if (err)
        return done();

      done(new Error('This should fail'));
    });
  });
});