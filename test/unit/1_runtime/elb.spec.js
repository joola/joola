describe("event loop blocks", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = joola.common.uuid();
    this.workspace = _token.user.workspace;
    this.collection = 'test-collection-ebl-' + this.uid;
    this.documents = require('../../fixtures/basic.json');
    this.start = new Date().getTime();
    this.elbtotal = 0;
    var self = this;
    joola.events.on('elb', function (delta) {
      self.elbtotal += delta;
    });

    return done();
  });

  it("should not cause an event loop block on excessive beacon [single doc]", function (done) {
    var self = this;
    var requested = 1000;
    var date = new Date().getTime();
    var push = function (i) {
      var doc = self.documents[0];
      doc.timestamp = new Date(date + i);
      joola.beacon.insert(self.context, self.context.user.workspace, self.collection, ce.clone(doc), function (err, doc) {
        doc = doc[0];
        expect(doc.saved).to.equal(true);
        if (i === requested - 1)
          done(err);
      });
    };
    for (var i = 0; i < requested; i++) {
      push(i);
    }
  });

  after(function (done) {
    this.end = new Date().getTime();
    console.log('duration', this.end - this.start, 'ms');
    console.log('blocked', this.elbtotal, 'ms');
    console.log('busy', this.elbtotal/(this.end-this.start)*100, '%');
    done();
  });
});