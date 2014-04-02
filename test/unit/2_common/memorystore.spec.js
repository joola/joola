describe("common-memory", function () {
  it("should have a valid store", function (done) {
    var store = joola.memory.getStoreContent();
    expect(store).to.be.ok;
    done();
  });

  it("set a value", function (done) {
    joola.memory.set('test', 'test');
    done();
  });

  it("get a value", function (done) {
    joola.memory.get('test');
    done();
  });

  it("set a value with expiry", function (done) {
    joola.memory.get('test-expire', 'test', 1);
    setTimeout(function () {
      var value = joola.memory.get('test');
      if (value)
        return done(new Error('Failed to expire memory value'));
      return done();
    }, 1100);
  });
});