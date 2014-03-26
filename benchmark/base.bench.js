var
  sdk = require('../node_modules/joola.io.sdk'),
  program = require('commander'),
  humanize = require('humanize-number');

program
  .option('-d, --duration <n>', 'duration of test [5000]', parseInt)
  .parse(process.argv);

sdk.init({host: 'http://localhost:8080', APIToken: 'apitoken-root', debug: {enabled: false}}, function (err) {
  if (err)
    throw err;

  var n = 0;
  var ops = 100;
  var req = 0;
  var errd = 0;
  var bytes = program.size || 1024;
  var fixtures = require('../test/fixtures/benchmark.json');
  bytes = new Buffer(JSON.stringify(fixtures)).length;
  console.log('bytes', bytes, fixtures.length);
  var prev = start = Date.now();
  var results = [];
  var uid = joolaio.common.uuid();
  console.log();

  function insert() {
    req++;
    joolaio.beacon.insert('benchmark-' + uid, fixtures, function (err, docs) {
      if (err)
        errd++;
      if (n++ % ops == 0) {
        var ms = Date.now() - prev;
        var sec = ms / 1000;
        var persec = ops / sec | 0;
        results.push(persec);
        process.stdout.write('\r  [' + persec + ' ops/s] [' + n + ']');
        prev = Date.now();
      }

    });
    setTimeout(insert, 0);
  }

  insert();

  function sum(arr) {
    return arr.reduce(function (sum, n) {
      return sum + n;
    });
  }

  function min(arr) {
    return arr.reduce(function (min, n) {
      return n < min
        ? n
        : min;
    });
  }

  function median(arr) {
    arr = arr.sort();
    return arr[arr.length / 2 | 0];
  }

  function done() {
    var ms = Date.now() - start;
    var avg = n / (ms / 1000);
    console.log('\n');
    console.log('      min: %s ops/s', humanize(min(results)));
    console.log('     mean: %s ops/s', humanize(avg | 0));
    console.log('   median: %s ops/s', humanize(median(results)));
    console.log('    total: %s ops in %ds', humanize(n), ms / 1000);
    console.log('  through: %d mb/s', ((avg * bytes) / 1024 / 1024).toFixed(2));
    console.log('requested: %d ops', req);
    console.log('completed: %d ops (%d%)', n, Math.round((n ) / req * 100));
    console.log('  success: %d ops (%d%)', (n - errd), Math.round((n - errd) / n * 100));
    console.log('  errored: %d ops', errd);
    console.log();
    process.exit();
  }

  process.on('SIGINT', done);
  setTimeout(done, program.duration || 5000);
});
