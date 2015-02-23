var
  path = require('path'),
  fs = require('fs'),
  istanbul = require('istanbul'),
  collector = new istanbul.Collector(),
  reporter = new istanbul.Reporter(),
  sync = false;

var files = fs.readdirSync(path.join(__dirname, '../../coverage'));
files.forEach(function (f) {
  if (f.indexOf('scenario_') > -1) {
    var filename = path.join(__dirname, '../../coverage', f, 'coverage.json');
    collector.add(JSON.parse(fs.readFileSync(filename, 'utf8')));
  }
});

reporter.add('text');
reporter.addAll(['lcov']);
reporter.write(collector, sync, function () {
  console.log('All reports generated');
});