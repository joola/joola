/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

var async = require('async');

describe("metric", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    this.workspace = global.workspace;
    this.collection = 'test-collection-metric-' + this.uid;

    var collection = {
      key: this.collection,
      name: this.collection,
      metrics: {
        attribute: {
          key: 'attribute',
          name: 'attribute',
          datatype: 'string'
        }
      }
    };
    engine.collections.add(this.context, this.workspace, collection, done);
  });

  it("should add a metric", function (done) {

    var metric = {
      key: 'test-metric-' + this.uid,
      name: 'metric'
    };

    engine.metrics.add(this.context, this.workspace, this.collection, metric, function (err, _metric) {
      if (err)
        return done(err);

      expect(_metric).to.be.ok;
      done();
    });
  });

  it("should return a valid list of metrics for all collections", function (done) {
    engine.metrics.list(this.context, this.workspace, function (err, metrics) {
      return done(err);
    });
  });

  it("should return a valid list of metrics for a specific collection", function (done) {
    engine.metrics.list(this.context, this.workspace, this.collection, function (err, metrics) {
      return done(err);
    });
  });

  it("should fail adding an existing metric", function (done) {
    var metric = {
      key: 'test-metric-' + this.uid,
      name: 'metric'
    };
    engine.metrics.add(this.context, this.workspace, this.collection, metric, function (err, _metric) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail to add a metric with incomplete details", function (done) {
    var metric = {
      key: 'test-metric-missing-details'
    };
    engine.metrics.add(this.context, this.workspace, this.collection, metric, function (err, _metric) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should update a metric", function (done) {
    var metric = {
      key: 'test-metric-' + this.uid,
      test: 1
    };
    engine.metrics.patch(this.context, this.workspace, this.collection, metric.key, metric, function (err, _metric) {
      if (err)
        return done(err);
      expect(_metric.test).to.equal(1);
      done();
    });
  });

  it("should fail updating unknown metric", function (done) {
    var metric = {
      key: 'test-metric1-' + this.uid
    };
    engine.metrics.patch(this.context, this.workspace, this.collection, metric.key, metric, function (err, _metric) {
      if (err)
        return done();

      done(new Error('This should have failed'));
    });
  });

  it("should delete a metric", function (done) {
    var self = this;
    var metric = 'test-metric-' + this.uid;
    engine.metrics.delete(this.context, this.workspace, this.collection, metric, function (err) {
      if (err)
        return done(err);

      engine.metrics.get(self.context, self.workspace, self.collection, metric, function (err, metric) {
        if (err)
          return done();

        return done('Failed to delete metric');
      });
    });
  });

  it("should fail deleting a non existing metric", function (done) {
    var metric = {
      key: 'test-metric-notexist'
    };
    engine.metrics.delete(this.context, this.workspace, this.collection, metric, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});