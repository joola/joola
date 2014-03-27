describe("common-utils", function () {
  it("should hook events", function (done) {
    var obj = {
      id: 'test',
      _id: 'test2',
      attribute: 'test',
      numeric: 123,
      run: function () {
        return 1 + 2;
      },
      innerobject: {
        attribute: 'another test',
        run: function () {
          return 3 + 4;
        }
      }
    };

    joola.common.hookEvents(obj);
    obj.run();
    expect(obj.hooked).to.equal(true);
    done();
  });

  it("should return hook events on null", function (done) {
    //as long as not throws ok
    joola.common.hookEvents(null);
    done();
  });

  it("should return hook events on non-object", function (done) {
    var obj = 'test';

    joola.common.hookEvents(obj);
    expect(obj).to.equal('test');
    done();
  });

  it("should async stringify objects", function (done) {
    var obj = {
      a: 1,
      b: 2
    };

    joola.common.stringify(obj, function (err, str) {
      expect(str).to.equal(JSON.stringify(obj));
      done();
    });
  });

  it("should async parse json string", function (done) {
    var obj = {
      a: 1,
      b: 2
    };
    var str = JSON.stringify(obj);

    joola.common.parse(str, function (err, _obj) {
      expect(str).to.equal(JSON.stringify(_obj));
      done();
    });
  });

  it("should hash strings correctly", function () {
    var expected = '26207976637e23e1bed51683c33a6d73';
    var actual = joola.common.hash('thisisatestforhash');
    expect(actual).to.equal(expected);
  });

  it("should sanitize objects", function (done) {
    var obj = {
      a: 1,
      _b: 2
    };
    joola.common.sanitize(obj);
    if (obj.a && !obj._b)
      return done();

    return done(new Error('Failed to sanitize object'));
  });

  it("should generate uuid - 9 chars long", function () {
    var expected = 9;
    var actual = joola.common.uuid().length;
    expect(actual).to.equal(expected);
  });

  it("should generate uuid - unique", function (done) {
    var ids = [];

    for (var i = 0; i < 3200; i++) {
      var uuid = joola.common.uuid();
      if (ids.indexOf(uuid) > -1) {
        return done(new Error('Found duplicate uuid [' + uuid + ']'));
      }
      ids.push(uuid);
    }

    return done();
  });

  it("should find nested json attributes", function () {
    var obj = {
      a: {
        b: {
          c: 123
        }
      }
    };
    var result = joola.common.checkNested(obj, 'a.b.c');
    expect(result).to.equal(123);
  });

  it("should not find missing nested json attributes[1]", function () {
    var obj = {
      a: {
        b: {

        }
      }
    };
    var result = joola.common.checkNested(obj, 'a.b.c');
    result = result || null;
    expect(result).to.equal(null);
  });

  it("should not find missing nested json attributes[2]", function () {
    var obj = {
      a: {
        b: {

        }
      }
    };
    var result = joola.common.checkNested(obj, 'a.b.c');
    result = result || null;
    expect(result).to.equal(null);
  });

  it("should typeof(null)", function () {
    expect(joola.common.typeof(null)).to.equal('null');
  });

  it("should typeof(string)", function () {
    expect(joola.common.typeof('string')).to.equal('string');
  });

  it("should typeof(number)", function () {
    expect(joola.common.typeof(123)).to.equal('number');
  });

  it("should typeof(regex)", function () {
    expect(joola.common.typeof(/.?/)).to.equal('regex');
  });

  it("should typeof(array)", function () {
    expect(joola.common.typeof([])).to.equal('array');
  });

  it("should typeof(date)", function () {
    expect(joola.common.typeof(new Date())).to.equal('date');
  });

  xit("should typeof('date')", function () {
    expect(joola.common.typeof(new Date().toString())).to.equal('date');
  });

  it("should typeof(obj)", function () {
    expect(joola.common.typeof({a: 1})).to.equal('object');
  });
});