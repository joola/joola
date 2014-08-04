#!/usr/bin/env node
/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var joola = module.exports = require('./lib/joola');

/* istanbul ignore if */
if (require.main === module || require.main.filename.indexOf('ProcessContainer.js') > -1 /*Allow PM2*/)
  joola.init();