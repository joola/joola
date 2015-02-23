describe("system", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    done();
  });

  it("should get the version", function (done) {
    engine.system.version(this.context, function (err, version) {
      if (err)
        return done(err);

      expect(version).to.be.ok;
      done();
    });
  });

  it("should get the node UID", function (done) {
    engine.system.nodeUID(this.context, function (err, uid) {
      if (err)
        return done(err);

      expect(uid).to.be.ok;
      done();
    });
  });

  it("should get the node list", function (done) {
    engine.system.nodeList(this.context, function (err, list) {
      if (err)
        return done(err);

      expect(list).to.be.ok;
      done();
    });
  });

  it("should get the node details", function (done) {
    engine.system.nodeDetails(this.context, function (err, details) {
      if (err)
        return done(err);

      expect(details).to.be.ok;
      done();
    });
  });

  it("should list the connected clients", function (done) {
    engine.system.connectedClients(this.context, function (err, clients) {
      if (err)
        return done(err);

      expect(clients).to.be.ok;
      done();
    });
  });

  it("should blacklist an ip", function (done) {
    engine.system.blacklist(this.context, '255.255.255.255', true, 0, function (err) {
      if (err)
        return done(err);

      done();
    });
  });

  it("should remove blacklisted ip", function (done) {
    engine.system.blacklist(this.context, '255.255.255.255', false, 0, function (err) {
      if (err)
        return done(err);

      done();
    });
  });

  it("should blacklist an ip with ttl", function (done) {
    engine.system.blacklist(this.context, '255.255.255.255', true, 1000, function (err) {
      if (err)
        return done(err);

      //TODO: Check expired
      done();
    });
  });

  it("should purge the cache", function (done) {
    engine.system.purgeCache(this.context, function (err) {
      if (err)
        return done(err);

      done();
    });
  });
});
