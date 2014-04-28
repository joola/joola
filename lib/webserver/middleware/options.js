exports.options = function (req, res, next) {
  var module, action, modulename;
  if (req.method === 'OPTIONS') {
    modulename = req.params.resource;
    action = req.params.action;

    if (!modulename)
      return exports.responseError(404, new ErrorTemplate('Module not specified.'), req, res);
    try {
      module = require('../../dispatch/' + modulename);
    }
    catch (ex) {
      console.log('err', ex);
      console.log(ex.stack);
      return exports.responseError(404, ex, req, res);
    }
    action = module[action];
  }
  if (action) {
    var verb = action.verb.toUpperCase();
    res.header('Access-Control-Allow-Methods', verb);
    res.header('Allow', verb);
    req.terminate = true;
  }
  else {
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Allow', action.verb.toUpperCase());
    req.terminate = true;
  }
  next();
};