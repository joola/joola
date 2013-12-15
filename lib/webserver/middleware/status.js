var
  path = require('path'),
  extend = require('util')._extend;

var depWalker = function (baseDir, deps, callback) {
  var _deps = extend({}, deps);
  Object.keys(_deps).forEach(function (dep) {
    var depPath = path.join(baseDir, 'node_modules', dep, 'package.json');
    try {
      var pkg = require(depPath);
      var version = pkg.version;
      _deps[dep] = version;
    }
    catch (err) {
      _deps[dep] = 'N/A';
    }
  });

  return callback(null, _deps);
};

// the middleware function
exports.status = function (req, res, next) {
  try {
    var baseDir = path.join(__dirname, '../../../');
    if (req.url.substring(0, 7) == '/status' && req.url.substring(7, 8) != '/') {
      var data = {};

      data.version = require(path.join(baseDir, './package.json')).version;

      data.os = {};
      data.os.Environment = process.env.JOOLAIO_ENV || 'N/A';
      data.os.Platform = process.platform || 'N/A';
      data.os.Architecture = process.arch || 'N/A';
      data.os["Base Directory"] = baseDir;
      data.os.Executable = process.execPath || 'N/A';
      data.os["Executable Arguments"] = process.execArgv || 'N/A';
      data.os.Arguments = process.argv || 'N/A';
      data.os["Node Version"] = process.version;

      data.usage = {};
      data.usage.memory = process.memoryUsage();

      data.dependencies = require(path.join(baseDir, 'package.json')).dependencies;
      depWalker(baseDir, data.dependencies, function (err, depTree) {
        data.dependencies = depTree;
        data.devDependencies = require(path.join(baseDir, 'package.json')).devDependencies;
        depWalker(baseDir, data.devDependencies, function (err, depTree) {
          data.devDependencies = depTree;
          return res.render(path.join(baseDir, './lib/webserver/views/status'), {data: data});
        });
      });
    }
    else
      return next();
  }
  catch (ex) {
    throw ex;
  }
};