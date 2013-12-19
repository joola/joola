/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("sdk-dimensions", function () {
  var _store, _bypassToken;
  before(function (done) {
    _store = joola.config.authentication.store;
    _bypassToken = joola.config.authentication.bypassToken;
    joola.config.set('authentication:store', 'bypass');
    joola.config.set('authentication:bypassToken', '123');

    joolaio.TOKEN = '123';

    joola.config.clear('dimensions:test-dimension-sdk', function (err) {
      if (err)
        throw err;

      var dt = {
        id: 'test-table-sdk',
        name: 'test-table-sdk',
        type: 'data',
        primaryKey: 'id',
        dateColumn: 'date',
        dimensions: {
          1: 1
        },
        metrics: {
          1: 1
        }
      };
      _sdk.dispatch.datatables.add(dt, function (err, datatable) {
        return done();
      });

    });
  });

  it("should return a valid list of dimensions", function (done) {
    _sdk.dispatch.dimensions.list(function (err) {
      return done(err);
    });
  });

  it("should add a dimension", function (done) {
    var dt = {
      datatable: 'test-table-sdk',
      id: 'test-dimension-sdk',
      name: 'test-dimension-sdk',
      description: 'test-dimension-sdk',
      column: 'test-column',
      category:'test',
      roles: ['user']
    };
    _sdk.dispatch.dimensions.add(dt, function (err, dimension) {
      if (err)
        return done(err);
      expect(dimension).to.be.ok;
      return done();
    });
  });

  it("should fail adding an existing dimension", function (done) {
    var dt = {
      datatable: 'test-table-sdk',
      id: 'test-dimension-sdk',
      name: 'test-dimension-sdk',
      description: 'test-dimension-sdk',
      column: 'test-column',
      category: 'test',
      roles: ['user']
    };
    _sdk.dispatch.dimensions.add(dt, function (err, dimension) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should get a dimension", function (done) {
    _sdk.dispatch.dimensions.get('test-dimension-sdk', function (err, dimension) {
      if (err)
        return done(err);
      expect(dimension).to.be.ok;
      expect(dimension.name).to.equal('test-dimension-sdk');
      return done();
    });
  });

  it("should update a dimension", function (done) {
    var dt = {
      datatable: 'test-table-sdk',
      id: 'test-dimension-sdk',
      name: 'test-dimension-sdk',
      description: 'test-dimension-sdk-2',
      column: 'test-column',
      category:'test',
      roles: ['user']
    };
    _sdk.dispatch.dimensions.update(dt, function (err, dimension) {
      if (err)
        return done(err);
      expect(dimension.description).to.equal('test-dimension-sdk-2');
      return done();
    });
  });

  it("should delete a dimension", function (done) {
    var ds = {
      name: 'test-dimension-sdk'
    };
    _sdk.dispatch.dimensions.delete(ds, function (err) {
      if (err)
        return done(err);
      _sdk.dispatch.dimensions.list(function (err, dimensions) {
        if (err)
          return done(err);

        var exist = _.filter(dimensions, function (item) {
          return item.name == 'test-dimension-sdk';
        });
        try {
          expect(exist.length).to.equal(0);
          return done();
        }
        catch (ex) {
          return done(ex);
        }
      })
    });
  });

  it("should fail deleting a non existing dimension", function (done) {
    var ds = {
      name: 'test-dimension-sdk-notexist'
    };
    joola.dispatch.dimensions.delete(ds, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  })

  after(function (done) {
    joola.config.set('authentication:store', _store);
    joola.config.set('authentication:bypassToken', _bypassToken);
    done();
  });
});