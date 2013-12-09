/**
 *  @title joola.io/lib/sdk/common/api
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 *
 *  Provides the SDK with a centralized management for consuming data from a joola.io
 *  node. All API calls are routed through this interface.
 **/

var
  http = require('http'),
  https = require('https'),
  querystring = require('querystring');

var api = exports;
api._id = 'api';

/**
 * Consumes an API endpoint based on options passed.
 * @param {string} endpoint the endpoint to consume
 * @param {object} objOptions options for the actual endpoint parameters
 * @param {function} callback called when the result arrives/error
 */
api.fetch = function (endpoint, objOptions, callback) {
  var self = this;
  try {
    var options = {
      host: joolaio.options.api.host,
      port: joolaio.options.api.port,
      secure: joolaio.options.api.secure,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    self.getJSON(options, objOptions, function (err, result) {
      return callback(err, result);
    });
  }
  catch (ex) {
    return callback(ex);
  }
};

/**
 * The actual worker for getting a json object from the API service based on the options passed.
 * @param {object} options options relating to the connection and endpoint
 * @param {object} objOptions options for the actual endpoint parameters
 * @param {function} callback called when the result arrives/error
 */
api.getJSON = function (options, objOptions, callback) {
  var prot = options.secure ? https : http;
  joolaio.logger.silly('[api] Fetching JSON from ' + options.host + ':' + options.port + options.path);

  if (!joolaio.io || options.ajax) {
    var qs = querystring.stringify(objOptions);
    options.path += '?' + qs;
    var req = prot.request(options, function (res) {
      var output = '';
      res.on('data', function (chunk) {
        output += chunk;
      });

      res.on('end', function () {
        var obj;
        try {
          obj = JSON.parse(output);
        }
        catch (ex) {
          joolaio.logger.error('[api] Received malformed JSON from server: ' + options.host + ':' + options.port + options.path + '. Error: ' + ex.message);
          return callback('[api] Received malformed JSON from server: ' + options.host + ':' + options.port + options.path + '. Error: ' + ex.message);
        }


        return callback(null, obj);
      });
    });

    req.on('error', function (err) {
      return callback(err);
    });

    req.end();
  }
  else {
    options.path = options.path.substring(1);

    var call = function (data) {
      joolaio.io.socket.removeListener(options.path + ':done', call);
      return callback(null, data);
    };

    joolaio.io.socket.emit(options.path, objOptions);
    joolaio.io.socket.on(options.path + ':done', call);
  }
};

api.buildstub = function (callback) {
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

    self.getJSON(options, {}, function (err, result) {
      Object.keys(result).forEach(function (endpoints) {
        api[endpoints] = {};
        Object.keys(result[endpoints]).forEach(function (fn) {
          var _fn = result[endpoints][fn];
          api[endpoints][fn] = function () {
            var args = arguments;
            callback = emptyfunc;
            if (typeof args[Object.keys(args).length-1] === 'function') {
              callback = args[Object.keys(args).length-1];
            }
            var argCounter = 0;
            Object.keys(args).forEach(function (arg) {
              if (argCounter < _fn.inputs.length) {
                args[_fn.inputs[argCounter]] = args[arg];
              }
              delete args[arg];
              argCounter++;
            });

            joolaio.logger.debug('[' + endpoints + ':' + fn + '] called with: ' + JSON.stringify(args));

            var options = args;
            api.fetch(_fn.name, options, function (err, result) {
              return callback(err, result.result);
            });
          }
        });
      });
    });
  }
  catch (ex) {
    return callback(ex);
  }
};
