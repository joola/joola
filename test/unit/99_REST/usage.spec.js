describe("usage", function () {
  before(function (done) {
    this.context = {user: joola.USER};
    this.collection = 'test-collection-dispatch-' + global.uid;

    //done();
    joola.set('APIToken', 'apitoken-demo', done);
  });

  after(function (done) {
    //joola.set('APIToken', 'apitoken-test', done);
    done();
  });

  xit("should allow retrieval of stats on behalf of", function (done) {
    var user = {
      username: 'bypass',
      password: 'bypass',
      workspace: '_stats',
      roles: ['reader'],
      filter: [
        //['workspace', 'eq', 'demo']
      ]
    };
    joola.users.generateToken(user, function (err, token) {
      if (err)
        return done(err);

      joola.set('APIToken', 'apitoken-test', function (err) {
        if (err)
          return done(err);

        var query = {
          timeframe: 'last_year',
          metrics: [
            {key: 'readCount', collection: 'reads'},
            //{key: 'writeCount', collection: 'writes'},
            //{key: 'simpleCount', collection: 'simple'}
          ],
          filter: []
        };
        joola.fetch({_: token._}, query, function (err, usage) {
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
