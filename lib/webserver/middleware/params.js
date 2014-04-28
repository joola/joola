exports.parseParams = function (req, res, next) {
  switch (req.method) {
    case 'GET':
      req.params = req.query;
      break;
    case 'POST':
      req.params = req.body;
      break;
    default:
      break;
  }

  return next();
};