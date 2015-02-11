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

describe("dimension", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    this.workspace = global.workspace;
    this.collection = 'test-collection-dimension-' + this.uid;

    var collection = {
      key: this.collection,
      name: this.collection,
      dimensions: {
        attribute: {
          key: 'attribute',
          name: 'attribute',
          datatype: 'string'
        }
      }
    };
    engine.collections.add(this.context, this.workspace, collection, done);
  });

  it("should add a dimension", function (done) {

    var dimension = {
      key: 'test-dimension-' + this.uid,
      name: 'dimension'
    };

    engine.dimensions.add(this.context, this.workspace, this.collection, dimension, function (err, _dimension) {
      if (err)
        return done(err);

      expect(_dimension).to.be.ok;
      done();
    });
  });

  it("should return a valid list of dimensions for all collections", function (done) {
    engine.dimensions.list(this.context, this.workspace, function (err, dimensions) {
      return done(err);
    });
  });

  it("should return a valid list of dimensions for a specific collection", function (done) {
    engine.dimensions.list(this.context, this.workspace, this.collection, function (err, dimensions) {
      return done(err);
    });
  });

  it("should fail adding an existing dimension", function (done) {
    var dimension = {
      key: 'test-dimension-' + this.uid,
      name: 'dimension'
    };
    engine.dimensions.add(this.context, this.workspace, this.collection, dimension, function (err, _dimension) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail to add a dimension with incomplete details", function (done) {
    var dimension = {
      key: 'test-dimension-missing-details'
    };
    engine.dimensions.add(this.context, this.workspace, this.collection, dimension, function (err, _dimension) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should update a dimension", function (done) {
    var dimension = {
      key: 'test-dimension-' + this.uid,
      test: 1
    };
    engine.dimensions.patch(this.context, this.workspace, this.collection, dimension.key, dimension, function (err, _dimension) {
      if (err)
        return done(err);
      expect(_dimension.test).to.equal(1);
      done();
    });
  });

  it("should fail updating unknown dimension", function (done) {
    var dimension = {
      key: 'test-dimension1-' + this.uid
    };
    engine.dimensions.patch(this.context, this.workspace, this.collection, dimension.key, dimension, function (err, _dimension) {
      if (err)
        return done();

      done(new Error('This should have failed'));
    });
  });

  it("should delete a dimension", function (done) {
    var self = this;
    var dimension = 'test-dimension-' + this.uid;
    engine.dimensions.delete(this.context, this.workspace, this.collection, dimension, function (err) {
      if (err)
        return done(err);

      engine.dimensions.get(self.context, self.workspace, self.collection, dimension, function (err, dimension) {
        if (err)
          return done();

        return done('Failed to delete dimension');
      });
    });
  });

  it("should fail deleting a non existing dimension", function (done) {
    var dimension = {
      key: 'test-dimension-notexist'
    };
    engine.dimensions.delete(this.context, this.workspace, this.collection, dimension, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});