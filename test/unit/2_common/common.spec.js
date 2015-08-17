describe("common-utils", function () {
  it("should async stringify objects", function (done) {
    var obj = {
      a: 1,
      b: 2
    };

    engine.common.stringify(obj, function (err, str) {
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

    engine.common.parse(str, function (err, _obj) {
      expect(str).to.equal(JSON.stringify(_obj));
      done();
    });
  });

  it("should hash strings correctly", function () {
    var expected = '26207976637e23e1bed51683c33a6d73';
    var actual = engine.common.hash('thisisatestforhash');
    expect(actual).to.equal(expected);
  });

  it("should sanitize objects", function (done) {
    var obj = {
      a: 1,
      _b: 2
    };
    engine.common.sanitize(obj);
    if (obj.a && !obj._b)
      return done();

    return done(new Error('Failed to sanitize object'));
  });

  it("should generate uuid - 9 chars long", function () {
    var expected = 9;
    var actual = engine.common.uuid(9).length;
    expect(actual).to.equal(expected);
  });

  it("should generate uuid - 32 chars long", function () {
    var expected = 32;
    var actual = engine.common.uuid().length;
    expect(actual).to.equal(expected);
  });

  it("should generate uuid - unique", function (done) {
    var ids = [];

    for (var i = 0; i < 3200; i++) {
      var uuid = engine.common.uuid();
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
    var result = engine.common.checkNested(obj, 'a.b.c');
    expect(result).to.equal(123);
  });

  it("should not find missing nested json attributes[1]", function () {
    var obj = {
      a: {
        b: {

        }
      }
    };
    var result = engine.common.checkNested(obj, 'a.b.c');
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
    var result = engine.common.checkNested(obj, 'a.b.c');
    result = result || null;
    expect(result).to.equal(null);
  });

  it("should typeof(null)", function () {
    expect(engine.common.typeof(null)).to.equal('null');
  });

  it("should typeof(string)", function () {
    expect(engine.common.typeof('string')).to.equal('string');
  });

  it("should typeof(number)", function () {
    expect(engine.common.typeof(123)).to.equal('number');
  });

  it("should typeof(regex)", function () {
    expect(engine.common.typeof(/.?/)).to.equal('regex');
  });

  it("should typeof(array)", function () {
    expect(engine.common.typeof([])).to.equal('array');
  });

  it("should typeof(date)", function () {
    expect(engine.common.typeof(new Date())).to.equal('date');
  });

  it("should typeof(obj)", function () {
    expect(engine.common.typeof({a: 1})).to.equal('object');
  });

  it("should flatten an object", function () {
    var obj = {
      a: 1,
      b: 'b',
      c: true,
      d: {
        da: 1,
        db: 'db',
        c: true
      }
    };
    var expected = [
      [ 'a', 1 ],
      [ 'b', 'b' ],
      [ 'c', true ],
      [ 'd.da', 1 ],
      [ 'd.db', 'db' ],
      [ 'd.c', true ]
    ];
    var flat = engine.common.flatten(obj);
    expect(expected).to.deep.equal(flat);
  });

  it("should nest an array", function () {
    var array = [
      [ 'a', 1 ],
      [ 'b', 'b' ],
      [ 'c', true ],
      [ 'd.da', 1 ],
      [ 'd.db', 'db' ],
      [ 'd.c', true ]
    ];
    var expected = {
      a: 1,
      b: 'b',
      c: true,
      d: {
        da: 1,
        db: 'db',
        c: true
      }
    };
    var nested = engine.common.nest(array);
    expect(expected).to.deep.equal(nested);
  });
});
