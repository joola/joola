/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("api-metrics", function () {
  before(function (done) {
    joola.config.clear('metrics:test-metric-api', function (err) {
      if (err)
        throw err;

      var dt = {
        id: 'test-table-api',
        name: 'test-table-api',
        type: 'data',
        primaryKey: 'id',
        dateColumn: 'date',
        metrics: {
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

  it("should return a valid list of metrics", function (done) {
    joola.dispatch.metrics.list(function (err) {
      return done(err);
    });
  });

  it("should add a metric", function (done) {
    var dt = {
      datatable: 'test-table-api',
      id: 'test-metric-api',
      name: 'test-metric-api',
      description: 'test-metric-api',
      column: 'test-column',
      type: 'int',
      aggregation: 'sum',
      category: 'test',
      roles: ['user']
    };
    joola.dispatch.metrics.add(dt, function (err, metric) {
      if (err)
        return done(err);
      expect(metric).to.be.ok;
      done();
    });
  });

  it("should fail adding an existing metric", function (done) {
    var dt = {
      datatable: 'test-table-api',
      id: 'test-metric-api',
      name: 'test-metric-api',
      description: 'test-metric-api',
      column: 'test-column',
      type: 'int',
      aggregation: 'sum',
      category: 'test',
      roles: ['user']
    };
    joola.dispatch.metrics.add(dt, function (err, metric) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail to add a metric with incomplete details", function (done) {
    var dt = {
      id: 'test-table-api-incomplete'
    };
    joola.dispatch.metrics.add(dt, function (err, metric) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should get a metric", function (done) {
    joola.dispatch.metrics.get('test-metric-api', function (err, metric) {
      if (err)
        return done(err);
      expect(metric).to.be.ok;
      expect(metric.name).to.equal('test-metric-api');
      return done();
    });
  });

  it("should update a metric", function (done) {
    var dt = {
      datatable: 'test-table-api',
      id: 'test-metric-api',
      name: 'test-metric-api',
      description: 'test-metric-api-2',
      column: 'test-column',
      type: 'int',
      aggregation: 'sum',
      category: 'test',
      roles: ['user']
    };
    joola.dispatch.metrics.update(dt, function (err, metric) {
      if (err)
        return done(err);
      expect(metric.description).to.equal('test-metric-api-2');
      done();
    });
  });

  it("should delete a metric", function (done) {
    var ds = {
      name: 'test-metric-api'
    };
    joola.dispatch.metrics.delete(ds, function (err) {
      if (err)
        return done(err);

      joola.dispatch.metrics.list(function (err, metrics) {
        if (err)
          return done(err);

        var exist = _.filter(metrics, function (item) {
          return item.name == 'test-metric-api';
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

  it("should fail deleting a non existing metric", function (done) {
    var ds = {
      name: 'test-metric-api-notexist'
    };
    joola.dispatch.metrics.delete(ds, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});