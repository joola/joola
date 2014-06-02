describe("collections", function () {
  before(function (done) {
    this.context = {user: joolaio.USER};
    this.collection = 'test-collection-dispatch-' + global.uid;

    //done();
    joolaio.set('APIToken', 'apitoken-demo', done);
  });

  after(function (done) {
    //joolaio.set('APIToken', 'apitoken-test', done);
    done();
  });

  it("should report total usage for system", function (done) {
    joolaio.system.usage(null, null, null, function (err, usage) {
      if (err)
        return done(err);

      expect(usage).to.be.ok;
      expect(usage.resultCount).to.be.ok;
      expect(usage.documents).to.be.ok;
      expect(usage.resultCount).to.be.greaterThan(0);
      done();
    });
  });

  it("should report total usage for workspace", function (done) {
    joolaio.system.usage('demo', null, null, function (err, usage) {
      if (err)
        return done(err);

      expect(usage).to.be.ok;
      expect(usage.resultCount).to.be.ok;
      expect(usage.documents).to.be.ok;
      expect(usage.resultCount).to.be.greaterThan(0);
      done();
    });
  });

  it("should report total usage for workspace/user", function (done) {
    joolaio.system.usage('demo', 'reader', null, function (err, usage) {
      if (err)
        return done(err);

      expect(usage).to.be.ok;
      expect(usage.resultCount).to.be.ok;
      expect(usage.documents).to.be.ok;
      expect(usage.resultCount).to.be.greaterThan(0);
      done();
    });
  });

  it("should report total usage for workspace/user/collection", function (done) {
    joolaio.system.usage('demo', 'reader', 'demo-visits', function (err, usage) {
      if (err)
        return done(err);

      expect(usage).to.be.ok;
      expect(usage.resultCount).to.be.ok;
      expect(usage.documents).to.be.ok;
      expect(usage.resultCount).to.be.greaterThan(0);
      done();
    });
  });

  it("should allow retrieval of stats on behalf of", function (done) {
    var user = {
      username: 'bypass',
      password: 'bypass',
      workspace: '_stats',
      roles: ['reader'],
      filter: [
        ['workspace', 'eq', 'demo']
      ]
    };
    joolaio.users.generateToken(user, function (err, token) {
      if (err)
        return done(err);

      joolaio.set('APIToken', 'apitoken-test', function (err) {
        if (err)
          return done(err);

        var query = {
          timeframe: 'last_year',
          //interval: 'month',
          //dimensions: [
          //  {key: 'timestamp', collection: 'query'}
          //],
          metrics: [
            {key: 'readCount', collection: 'query'},
            {key: 'writeCount', collection: 'beacon'}
          ],
          filter: []
        };
        joolaio.query.fetch({_: token._}, query, function (err, usage) {
          if (err)
            return done(err);

          expect(usage).to.be.ok;
          expect(usage.resultCount).to.be.ok;
          expect(usage.documents).to.be.ok;
          expect(usage.resultCount).to.be.greaterThan(0);
          done();
        });
      });
    });
  });
});
