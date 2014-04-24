var common = require('../lib/common/index');
var benchrest = require('bench-rest');
var flows = [
  './flows/beacon.spec.js',
  //'./flows/beacon.large.spec.js',
  './flows/metadata.spec.js'
];

global.JOOLA_ADDRESS = 'http://127.0.0.1:8080';

var results = {};
results.benchmarkID = common.uuid();
results.timestamp = new Date();
results.flows = {};
results.flowCount = flows.length;

var actual = 0;

var joolaio = require('joola.io.sdk');
joolaio.init({host: 'http://localhost:8080', APIToken: 'apitoken-root', ajax: true}, function (err) {
  joolaio.system.nodeDetails(function (err, details) {
    if (err)
      throw err;

    results.nodeDetails = details;

    flows.forEach(function (flow) {
      console.log('Running Flow', flow);
      var flowModule = require(flow);
      var runOptions = flowModule.runOptions;
      var flowExeuction = flowModule.flow;
      var errors = [];

      benchrest(flowExeuction, runOptions)
        .on('error', function (err, ctxName) {
          console.error('Failed in %s with err: ', ctxName, err);
        })
        .on('progress', function (stats, percent, concurrent, ips) {
          console.log('Progress: %s complete', percent);
        })
        .on('end', function (stats, errorCount) {
          console.log(stats);
          stats.name = flowModule.name;
          results.flows[flowModule.name] = stats;

          if (++actual === results.flowCount)
            return alldone();
        });

    });
  });

  function alldone() {
    console.log(results);
    joolaio.beacon.insert('benchmark', results, function (err) {
      if (err)
        throw err;
      process.exit(0);
    });
  }
});
