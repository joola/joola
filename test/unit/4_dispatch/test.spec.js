describe("system", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = joola.common.uuid();
    done();
  });

  it("should validate route [with permission]", function (done) {
    joola.test.withpermission(this.context, function (err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      done();
    });
  });

  it("should validate route [with no permission]", function (done) {
    joola.test.nopermission(this.context, function (err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      done();
    });
  });

  it("shoud validate route [expcetion]", function (done) {
    joola.test.createtesterror(this.context, function (err, result) {
      if (err)
        return done(err);

      expect(result).to.be.ok;
      done();
    });
  });
});