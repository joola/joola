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
  http = require('http'),
  https = require('https'),
  querystring = require('querystring');

var api = exports;
api._id = 'api';

api.getJSON = function (options, objOptions, callback) {
  var prot = options.secure ? https : http;
  joolaio.logger.silly('[api] Fetching JSON from ' + options.host + ':' + options.port + options.path);

  if (!joolaio.io) {
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
          return callback('Received malformed JSON from server');
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

api.fetch = function (endpoint, objOptions, callback) {
  var self = this;

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
};
