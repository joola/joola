describe("system", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = joola.common.uuid();
    done();
  });

  it("should get the version", function (done) {
    joola.system.version(this.context, function (err, version) {
      if (err)
        return done(err);

      expect(version).to.be.ok;
      done();
    });
  });

  it("should get the node UID", function (done) {
    joola.system.nodeUID(this.context, function (err, uid) {
      if (err)
        return done(err);

      expect(uid).to.be.ok;
      done();
    });
  });

  it("should get the node list", function (done) {
    joola.system.nodeList(this.context, function (err, list) {
      if (err)
        return done(err);

      expect(list).to.be.ok;
      done();
    });
  });

  it("should get the node details", function (done) {
    joola.system.nodeDetails(this.context, function (err, details) {
      if (err)
        return done(err);

      expect(details).to.be.ok;
      done();
    });
  });

  it("should list the connected clients", function (done) {
    joola.system.connectedClients(this.context, function (err, clients) {
      if (err)
        return done(err);

      expect(clients).to.be.ok;
      done();
    });
  });

  it("should purge the cache", function (done) {
    joola.system.purgeCache(this.context, function (err) {
      if (err)
        return done(err);

      done();
    });
  });
});