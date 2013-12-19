/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("sdk-metrics", function () {
  var _store, _bypassToken;
  before(function (done) {
    _store = joola.config.authentication.store;
    _bypassToken = joola.config.authentication.bypassToken;
    joola.config.set('authentication:store', 'bypass');
    joola.config.set('authentication:bypassToken', '123');

    joolaio.TOKEN = '123';

    joola.config.clear('metrics:test-metric-sdk', function (err) {
      if (err)
        throw err;

      var dt = {
        id: 'test-table-sdk',
        name: 'test-table-sdk',
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
      _sdk.dispatch.datatables.add(dt, function (err, datatable) {
        return done();
      });

    });
  });

  it("should return a valid list of metrics", function (done) {
    _sdk.dispatch.metrics.list(function (err) {
      return done(err);
    });
  });

  it("should add a metric", function (done) {
    var dt = {
      datatable: 'test-table-sdk',
      id: 'test-metric-sdk',
      name: 'test-metric-sdk',
      description: 'test-metric-sdk',
      column: 'test-column',
      type: 'int',
      aggregation: 'sum',
      category: 'test',
      roles: ['user']
    };
    _sdk.dispatch.metrics.add(dt, function (err, metric) {
      if (err)
        return done(err);
      expect(metric).to.be.ok;
      return done();
    });
  });

  it("should fail adding an existing metric", function (done) {
    var dt = {
      datatable: 'test-table-sdk',
      id: 'test-metric-sdk',
      name: 'test-metric-sdk',
      description: 'test-metric-sdk',
      column: 'test-column',
      type: 'int',
      aggregation: 'sum',
      category: 'test',
      roles: ['user']
    };
    _sdk.dispatch.metrics.add(dt, function (err, metric) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should get a metric", function (done) {
    _sdk.dispatch.metrics.get('test-metric-sdk', function (err, metric) {
      if (err)
        return done(err);
      expect(metric).to.be.ok;
      expect(metric.name).to.equal('test-metric-sdk');
      return done();
    });
  });

  it("should update a metric", function (done) {
    var dt = {
      datatable: 'test-table-sdk',
      id: 'test-metric-sdk',
      name: 'test-metric-sdk',
      description: 'test-metric-sdk-2',
      column: 'test-column',
      type: 'int',
      aggregation: 'sum',
      category: 'test',
      roles: ['user']
    };
    _sdk.dispatch.metrics.update(dt, function (err, metric) {
      if (err)
        return done(err);
      expect(metric.description).to.equal('test-metric-sdk-2');
      return done();
    });
  });

  it("should delete a metric", function (done) {
    var ds = {
      name: 'test-metric-sdk'
    };
    _sdk.dispatch.metrics.delete(ds, function (err) {
      if (err)
        return done(err);
      _sdk.dispatch.metrics.list(function (err, metrics) {
        if (err)
          return done(err);

        var exist = _.filter(metrics, function (item) {
          return item.name == 'test-metric-sdk';
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

  it("should fail deleting a non existing metric", function (done) {
    var ds = {
      name: 'test-metric-sdk-notexist'
    };
    joola.dispatch.metrics.delete(ds, function (err) {
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