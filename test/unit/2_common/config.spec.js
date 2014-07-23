/**
 *  joola
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

describe("common-config", function () {
  it("should have a valid config object", function (done) {
    expect(joola.config).to.be.ok;
    done();
  });

  it("should store a new config value", function (done) {
    joola.config.set('test:test1', 'test123', function (err) {
      if (err)
        return done(err);

      joola.config.get('test:test1', function (err, value) {
        if (err)
          return done(err);

        if (value)
          return done();
        else
          return done(new Error('Failed to get value'));
      });
    });
  });

  it("should delete a config value", function (done) {
    joola.config.set('test:test2', 'test123', function (err) {
      if (err)
        return done(err);

      joola.config.get('test:test2', function (err, value) {
        if (value) {
          joola.config.clear('test:test2', function (err) {
            if (err)
              return done(err);
            joola.config.get('test:test2', function (_err, _value) {
              if (_err)
                return done(_err);

              if (_value) {
                return done(new Error('Failed to expire value'));
              }
              else
                return done();
            });
          });
        }
        else
          return done(new Error('Failed to get value'));
      });
    });
  });

  it("should overwrite a config value with env var", function (done) {
    process.env.JOOLAIO_CONFIG_TEST_TEST1 = 'test1234';
    joola.config.overrideWithEnvironment();
    joola.config.get('test:test1', function (err, value) {
      if (err)
        return done(err);

      expect(value).to.equal('test1234');
      return done();
    });
  });

});