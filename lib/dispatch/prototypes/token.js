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
  joola = require('../../joola');

var proto = {
  "user": {
    "name": "user",
    "description": "The user assosicated with the token",
    "type": "object",
    "required": true,
    "private": true
  },
  "token": {
    "name": "token",
    "description": "The token itself",
    "required": true
  },
  "_": {
    "name": "_",
    "description": "The token itself",
    "required": true
  },
  "timestamp": {
    "name": "timestamp",
    "description": "The token generation timestamp",
    "required": true
  },
  "last": {
    "name": "last",
    "description": "The token last usage timestamp",
    "required": true
  },
  "expires": {
    "name": "expires",
    "description": "The token expiry timestamp",
    "type": "int",
    "required": true
  }
};

var Token = module.exports;
Token.proto = proto;