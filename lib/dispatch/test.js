/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

var joola = require('../joola.io');

exports.withpermission = {
  name: "/api/test/withpermission",
  description: "I make sure that tests run fine",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system', 'access_system'],
  dispatch: function () {
  },
  route: function (req, res) {
    res.json({test: 1});
  },
  run: function (callback) {
    return callback();
  }
};

exports.withpermission = {
  name: "/api/test/withpermission",
  description: "I make sure that tests run fine",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system', 'access_system'],
  dispatch: function () {
  },
  route: function (req, res) {
    res.json({test: 1});
  },
  run: function (callback) {
    return callback();
  }
};

exports.nopermission = {
  name: "/api/test/nopermission",
  description: "I make sure that tests run fine",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  dispatch: function () {
  },
  route: function (req, res) {
    res.json({test: 1});
  },
  run: function (callback) {
    return callback();
  }
};

exports.createtesterror = {
  name: "/api/test/createtesterror",
  description: "I make sure that tests run fine",
  inputs: [],
  _outputExample: {},
  _permission: [],
  dispatch: function () {
  },
  route: function (req, res) {
    throw new Error('Test');
  },
  run: function (callback) {
    return callback();
  }
};
