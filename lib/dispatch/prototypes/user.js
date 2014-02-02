/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

var
  crypto = require('crypto');

var proto = {
  "_id": "user",
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
  "_email": {
    "name": "_email",
    "description": "The user's email address",
    "required": false
  },
  "_password": {
    "name": "_password",
    "description": "The user's password",
    "required": true
  },
  "_roles": {
    "name": "_roles",
    "description": "The user's roles",
    "required": true
  },
  "_filter": {
    "name": "_filter",
    "description": "The user's filter",
    "required": false
  },
  "organization": {
    "name": "organization",
    "description": "The user's organization",
    "required": true
  },
  "store": {
    "name": "store",
    "description": "The user's authentication store",
    "required": false
  },
  "lastlogin": {
    "name": "lastlogin",
    "description": "The user's last login date",
    "required": false
  },
  "logincount": {
    "name": "logincount",
    "description": "The user's login count",
    "required": false
  }


};

var User = module.exports = function (user, callback) {
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

  /*joola.dispatch.organizations.get(user.organization, function (err, org) {
   if (err)
   return callback(err);

   user._filter = user._filter + (typeof org._filter !== 'undefined' ? org._filter : '');
   return callback(null, user);
   });*/
  return callback(null, user);
};

User.proto = proto;