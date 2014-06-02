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
          metrics: [
            {key: 'readCount', collection: 'reads'},
            {key: 'writeCount', collection: 'writes'},
            {key: 'simpleCount', collection: 'simple'}
          ],
          filter: []
        };
        joolaio.query.fetch({_: token._}, query, function (err, usage) {
          if (err)
            return done(err);

          expect(usage).to.be.ok;
          //expect(usage.resultCount).to.be.greaterThan(0);
          done();
        });
      });
    });
  });
});
