describe("security-permissions", function () {
  before(function (done) {
    this.admin_APIToken='12345';
    
    this.reader_APIToken = '7890';
    this.beacon_APIToken = '1234';
    done();
  });

  it("should not be able to access API without valid token", function (done) {
    joola.query.fetch(this.context, query, function (err, result) {
      //console.log(err, result);
      //if (!result.documents[0].values.value)
      //  return done(new Error('Failed [null]'));

      //expect(result.documents[0].values.value).to.equal(3);
      done(err);
    });
  });
});