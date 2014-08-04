/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var joola = require('../joola');

exports.withpermission = {
  name: "/test/withpermission",
  description: "I make sure that tests run fine",
  inputs: [],
  _outputExample: {},
  _permission: ['guest'],
  _dispatch: function () {
  },
  _route: function (req, res) {
    res.json({test: 1});
  },
  run: function (context, callback) {
    return callback(null, {result: 1});
  }
};

exports.nopermission = {
  name: "/test/nopermission",
  description: "I make sure that tests run fine",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: function () {
  },
  _route: function (req, res) {
    res.json({test: 1});
  },
  run: function (context, callback) {
    return callback(null, {result: 1});
  }
};

exports.createtesterror = {
  name: "/test/createtesterror",
  description: "I make sure that tests run fine",
  inputs: [],
  _outputExample: {},
  _permission: [],
  _dispatch: function () {
  },
  _route: function (req, res) {
    throw new Error('Test');
  },
  run: function (context, callback) {
    return callback(null, {result: 1});
  }
};
