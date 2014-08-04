var joola = require('../../joola');

exports.middleware = function (endpoint) {
  return function (req, res, next) {
    req.endpoint = endpoint;
    req.endpointRoute = {
      module: endpoint.split('/')[1],
      action: endpoint.split('/')[2]
    };

    req.parsed = joola.common.extend({}, req.params);
    var keys = Object.keys(req.parsed);
    keys.reverse();
    var _parsedSorted = {};
    keys.forEach(function (key) {
      _parsedSorted[key] = req.parsed[key];
    });
    req.parsed = _parsedSorted;
    switch (req.method) {
      case 'POST':
        req.parsed.payload = req.body;
        break;
      case 'PATCH':
        req.parsed.payload = req.body;
        break;
      default:
        break;
    }

    req.tokens = {
      APIToken: null,
      accessToken: null
    };
    if (req.query && req.query.APIToken)
      req.tokens.APIToken = req.query.APIToken;
    if (req.query && req.query.accessToken)
      req.tokens.accessToken = req.query.accessToken;

    if (req.tokens.accessToken)
      req.tokens.APIToken = null;

    return joola.auth.middleware(req, res, next);
  };
};