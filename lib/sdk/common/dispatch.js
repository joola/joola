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
var dispatch = exports;
dispatch._id = 'dispatch';

dispatch.buildstub = function (callback) {
  callback = callback || emptyfunc;

  var self = this;
  try {
    var options = {
      host: joolaio.options.api.host,
      port: joolaio.options.api.port,
      secure: joolaio.options.api.secure,
      path: '/api.js',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      ajax: true
    };

    joolaio.api.getJSON(options, {}, function (err, result) {
      Object.keys(result).forEach(function (endpoints) {
        dispatch[endpoints] = {};
        Object.keys(result[endpoints]).forEach(function (fn) {
          var _fn = result[endpoints][fn];
          dispatch[endpoints][fn] = function () {
            var args = arguments;
            callback = emptyfunc;
            if (typeof args[Object.keys(args).length - 1] === 'function') {
              callback = args[Object.keys(args).length - 1];
            }
            var argCounter = 0;
            var _args=[];
            Object.keys(args).forEach(function (arg) {
              if (argCounter < _fn.inputs.length) {
                args[_fn.inputs[argCounter]] = args[arg];
                _args.push(args[arg]);
              }
              delete args[arg];
              argCounter++;
            });

            joolaio.logger.debug('[' + endpoints + ':' + fn + '] called with: ' + JSON.stringify(args));

            joolaio.api.fetch(_fn.name, args, function (err, result) {
              return callback(err, result.result);
            });
          };
        });
      });
    });
  }
  catch (ex) {
    return callback(ex);
  }
};
