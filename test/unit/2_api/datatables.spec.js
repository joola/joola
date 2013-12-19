/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("api-datatables", function () {
  before(function (done) {
    joola.config.clear('datatables:test-table-api', function (err) {
      if (err)
        throw err;
      done();
    });
  });

  it("should return a valid list of data tables", function (done) {
    joola.dispatch.datatables.list(function (err) {
      return done(err);
    });
  });

  it("should add a data table", function (done) {
    var dt = {
      id: 'test-table-api',
      name: 'test-table-api',
      type: 'data',
      primaryKey: 'id',
      dateColumn: 'date',
      dimensions: [],
      metrics: []
    };
    joola.dispatch.datatables.add(dt, function (err, datatable) {
      if (err)
        return done(err);
      expect(datatable).to.be.ok;
      done();
    });
  });

  it("should fail adding an existing data table", function (done) {
    var dt = {
      id: 'test-table-api',
      name: 'test-table-api',
      type: 'data',
      primaryKey: 'id',
      dateColumn: 'date',
      dimensions: [],
      metrics: []
    };
    joola.dispatch.datatables.add(dt, function (err, datatable) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail to add a data table with incomplete details", function (done) {
    var dt = {
      id: 'test-table-api-incomplete'
    };
    joola.dispatch.datatables.add(dt, function (err, datatable) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should get a data table", function (done) {
    joola.dispatch.datatables.get('test-table-api', function (err, datatable) {
      if (err)
        return done(err);
      expect(datatable).to.be.ok;
      expect(datatable.name).to.equal('test-table-api');
      return done();
    });
  });

  it("should update a data table", function (done) {
    var dt = {
      id: 'test-table-api',
      name: 'test-table-api2',
      type: 'data',
      primaryKey: 'id',
      dateColumn: 'date',
      dimensions: [],
      metrics: []
    };
    joola.dispatch.datatables.update(dt, function (err, datatable) {
      if (err)
        return done(err);
      expect(datatable.name).to.equal('test-table-api2');
      done();
    });
  });

  it("should delete a data table", function (done) {
    var ds = {
      name: 'test-table-api2'
    };
    joola.dispatch.datatables.delete(ds, function (err) {
      if (err)
        return done(err);

      joola.dispatch.datatables.list(function (err, datatables) {
        if (err)
          return done(err);

        var exist = _.filter(datatables, function (item) {
          return item.name == 'test-table-api2';
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

  it("should fail deleting a non existing datatable", function (done) {
    var ds = {
      name: 'test-table-api-notexist'
    };
    joola.dispatch.datatables.delete(ds, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});