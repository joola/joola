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

describe("canvas", function () {
  before(function (done) {
    this.context = {user: _token.user};
    this.uid = engine.common.uuid();
    this.workspace = global.workspace;
    done();
  });

  it("should add a canvas", function (done) {
    var canvas = {
      key: 'test-canvas-' + this.uid,
      name: 'canvas'
    };

    engine.canvases.add(this.context, this.workspace, canvas, function (err, _canvas) {
      if (err)
        return done(err);

      expect(_canvas).to.be.ok;
      done();
    });
  });

  it("should return a valid list of canvases", function (done) {
    engine.canvases.list(this.context, this.workspace, function (err, canvases) {
      return done(err);
    });
  });

  it("should fail adding an existing canvas", function (done) {
    var canvas = {
      key: 'test-canvas-' + this.uid,
      name: 'canvas'
    };
    engine.canvases.add(this.context, this.workspace, canvas, function (err, _canvas) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail to add a canvas with incomplete details", function (done) {
    var canvas = {
      key: 'test-canvas-missing-details'
    };
    engine.canvases.add(this.context, this.workspace, canvas, function (err, _canvas) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should update a canvas", function (done) {
    var canvas = {
      key: 'test-canvas-' + this.uid,
      test: 1
    };
    engine.canvases.patch(this.context, this.workspace, canvas.key, canvas, function (err, _canvas) {
      if (err)
        return done(err);
      expect(_canvas.test).to.equal(1);
      done();
    });
  });

  it("should fail updating unknown canvas", function (done) {
    var canvas = {
      key: 'test-canvas1-' + this.uid
    };
    engine.canvases.patch(this.context, this.workspace, canvas.key, canvas, function (err, _canvas) {
      if (err)
        return done();

      done(new Error('This should have failed'));
    });
  });

  it("should delete a canvas", function (done) {
    var self = this;
    var canvas = 'test-canvas-' + this.uid;
    engine.canvases.delete(this.context, this.workspace, canvas, function (err) {
      if (err)
        return done(err);

      engine.canvases.get(self.context, self.workspace, canvas, function (err, canvas) {
        if (canvas)
          return done(new Error('Failed to delete canvas'));

        return done();
      });
    });
  });

  it("should fail deleting a non existing canvas", function (done) {
    var canvas = {
      key: 'test-canvas-notexist'
    };
    engine.canvases.delete(this.context, this.workspace, canvas, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});