/**
 *  @title joola.io/lib/webserver/middleware/error
 *  @overview Error management middleware for Express/Connect.
 *  @description
 *  Catches processing issues raised by the HTTP server (Express/Connect) and handles them nicely.
 *
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/

var joola = require('../../joola.io');

/**
 * @param {Object} req holds the http request.
 * @param {Object} res holds the http response.
 * @param {Function} next called following execution with errors and results.
 * 404 middleware. Catches errors of missing pages/resources and renders a pretty 404 page to the requestor.
 *
 * The function calls on completion an optional `next` with:
 * - `err` if occured, an error object, else null.
 */
exports.error_400 = function (req, res, next) {
  res.status(404);
  res.render('404', {
    status: 404,
    url: req.url
  });
};

/**
 * @param {Object} err holds the exception object.
 * @param {Object} req holds the http request.
 * @param {Object} res holds the http response.
 * @param {Function} next called following execution with errors and results.
 * 500 middleware. Catches exceptions and errors raised as the result of processing and shows a pretty 500 page.
 *
 * The function calls on completion an optional `next` with:
 * - `err` if occured, an error object, else null.
 */
exports.error_500 = function (err, req, res, next) {
  /* istanbul ignore if */
  if (res.handled)
    return next();

  /* istanbul ignore if */
  if (err.toString().indexOf('Failed to lookup view') > -1) {
    res.status(404);
    res.render('404', {
      status: 404,
      url: req.url
    });
  }
  else if (err.code == 401) {
    /* istanbul ignore next */
    res.status(401);
    /* istanbul ignore next */
    res.render('401', {
      status: err.status || 401,
      error: err,
      stack: err.stack.replace(/\n/gi, '<br />')
    });
  }
  else {
    res.status(500);
    res.render('500', {
      status: err.status || 500,
      error: err,
      stack: err.stack ? err.stack.replace(/\n/gi, '<br />') : ''
    });
  }

};
