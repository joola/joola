/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("api-dimensions", function () {
  before(function (done) {
    joola.config.clear('dimensions:test-dimension-api', function (err) {
      if (err)
        throw err;

      var dt = {
        id: 'test-table-api',
        name: 'test-table-api',
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
      joola.dispatch.datatables.add(dt, function (err, datatable) {
        done();
      });
    });
  });

  it("should return a valid list of dimensions", function (done) {
    joola.dispatch.dimensions.list(function (err) {
      return done(err);
    });
  });

  it("should add a dimension", function (done) {
    var dt = {
      datatable: 'test-table-api',
      id: 'test-dimension-api',
      name: 'test-dimension-api',
      description: 'test-dimension-api',
      column: 'test-column',
      roles: ['user']
    };
    joola.dispatch.dimensions.add(dt, function (err, dimension) {
      if (err)
        return done(err);
      expect(dimension).to.be.ok;
      done();
    });
  });

  it("should fail adding an existing dimension", function (done) {
    var dt = {
      datatable: 'test-table-api',
      id: 'test-dimension-api',
      name: 'test-dimension-api',
      description: 'test-dimension-api',
      column: 'test-column',
      roles: ['user']
    };
    joola.dispatch.dimensions.add(dt, function (err, dimension) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail to add a dimension with incomplete details", function (done) {
    var dt = {
      id: 'test-table-api-incomplete'
    };
    joola.dispatch.dimensions.add(dt, function (err, dimension) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should get a dimension", function (done) {
    joola.dispatch.dimensions.get('test-dimension-api', function (err, dimension) {
      if (err)
        return done(err);
      expect(dimension).to.be.ok;
      expect(dimension.name).to.equal('test-dimension-api');
      return done();
    });
  });

  it("should update a dimension", function (done) {
    var dt = {
      datatable: 'test-table-api',
      id: 'test-dimension-api',
      name: 'test-dimension-api',
      description: 'test-dimension-api-2',
      column: 'test-column',
      roles: ['user']
    };
    joola.dispatch.dimensions.update(dt, function (err, dimension) {
      if (err)
        return done(err);
      expect(dimension.description).to.equal('test-dimension-api-2');
      done();
    });
  });

  it("should delete a dimension", function (done) {
    var ds = {
      name: 'test-dimension-api'
    };
    joola.dispatch.dimensions.delete(ds, function (err) {
      if (err)
        return done(err);

      joola.dispatch.dimensions.list(function (err, dimensions) {
        if (err)
          return done(err);

        var exist = _.filter(dimensions, function (item) {
          return item.name == 'test-dimension-api';
        });
        try {
          expect(exist.length).to.equal(0);
          done();
        }
        catch (ex) {
          done(ex);
        }
      });
    });
  });

  it("should fail deleting a non existing dimension", function (done) {
    var ds = {
      name: 'test-dimension-api-notexist'
    };
    joola.dispatch.dimensions.delete(ds, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});