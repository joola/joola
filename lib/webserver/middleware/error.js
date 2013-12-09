/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

exports.error_400 = function (req, res, next) {
  // the status option, or res.statusCode = 404
  // are equivalent, however with the option we
  // get the "status" local available as well
  res.status(404);
  res.render('404', {
    status: 404,
    url: req.url
  });
};

exports.error_500 = function (err, req, res, next) {
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().

  if (err.code == 401) {
    res.status(401);
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
      stack: err.stack.replace(/\n/gi, '<br />')
    });
  }
};
