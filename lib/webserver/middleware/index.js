var joola = require('../../joola.io');

exports.middleware = function (req, res, next) {
  req.parsed = joola.common.extend({}, req.params);
  var keys = Object.keys(req.parsed);
  keys.reverse();
  var _parsedSorted = {};
  keys.forEach(function (key) {
    _parsedSorted[key] = req.parsed[key];
  });
  req.parsed = _parsedSorted;
  switch (req.method) {
    case 'GET':
      //req.parsed = joola.common.extend(req.parsed, req.query);
      break;
    case 'POST':
      //req.parsed = joola.common.extend(req.parsed, req.query);
      req.parsed.payload = req.body;
      break;
    case 'PATCH':
      //req.parsed = joola.common.extend(req.parsed, req.query);
      req.parsed.payload = req.body;    
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

  return require('../../auth').middleware(req, res, next);
};

