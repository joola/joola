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

var
  joola = require('../../joola'),

  async = require('async');

var proto = {
  "username": {
    "name": "username",
    "description": "The user's username",
    "type": "string",
    "required": true
  },
  "displayName": {
    "name": "displayName",
    "description": "The displayname of the user",
    "required": false
  },
  "password": {
    "name": "password",
    "description": "The user's password",
    "required": false,
    "private": true,
    "hidden": true
  },
  "roles": {
    "name": "roles",
    "description": "The user's roles",
    "required": true,
    "private": true
  },
  "filter": {
    "name": "filter",
    "description": "The user's filter",
    "type": "array",
    "default": [],
    "required": false,
    "private": true
  },
  "APIToken": {
    "name": "APIToken",
    "description": "The user's API Token",
    "required": false,
    "private": true
  },
  "workspace": {
    "name": "workspace",
    "description": "The user's Workspace",
    "required": false
  },
  "token": {
    "name": "token",
    "description": "The user's current security token",
    "required": false
  }
};

var User = module.exports = function (context, workspace, user, callback) {
  var self = this;
  this._proto = proto;
  this._super = {};
  for (var x in require('./base')) {
    this[x] = require('./base')[x];
    this._super[x] = require('./base')[x];
  }

  if (!user)
    return self;

  for (var y in user) {
    this[y] = user[y];
  }

  var validationErrors = this.validate(user);
  if (validationErrors.length > 0)
    return callback(new Error('Failed to verify new user, fields: [' + validationErrors.join(',') + ']'));

  joola.dispatch.workspaces.get(context, workspace, function (err, wrk) {
    if (err)
      return callback(err);

    //user._filter = user._filter + (typeof wrk._filter !== 'undefined' ? wrk._filter : '');
    user.workspace = workspace;

    //check roles exist
    if (!user.roles)
      return callback(new Error('User must have at least one role assigned.'));
    if (!Array.isArray(user.roles)) {
      user.roles = [user.roles];
      //return callback(new Error('User must have at least one role assigned.'));
    }
    if (user.roles.length === 0)
      return callback(new Error('User must have at least one role assigned.'));


    user.ratelimit = user.ratelimit || wrk.ratelimit || joola.config.get('authentication:ratelimits:user');

    async.map(user.roles, function (role, callback) {
      joola.dispatch.roles.get(context, workspace, role, callback);
    }, function (err) {
      if (err)
        return callback(err);

      return callback(null, user);
    });
  });
};

User.proto = proto;