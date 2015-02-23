var
  util = require('util'),
  benchrest = require('bench-rest'),

  common = require('../../lib/common/index');

var flows = [
  './flows/beacon.spec.js',
  //'./flows/beacon.large.spec.js',
  './flows/metadata.spec.js'
];

global.JOOLA_ADDRESS = 'http://127.0.0.1:8080';
var VERSION = '0.0.1';

var results = {};
results.benchmarkID = common.uuid();
results.timestamp = new Date();
results.flows = [];
results.flowCount = flows.length;

var actual = 0;

//TODO: change this to be part of general mocha tests.
if (module.parent) //make sure the script was manually called
  return;

var joola = require('joola.sdk');
joola.init({host: JOOLA_ADDRESS, APIToken: 'apitoken-demo'}, function (err) {
  if (err)
    throw err;

  joola.system.nodeDetails(function (err, details) {
    if (err)
      throw err;

    results.nodeDetails = details;
    results.version = VERSION;
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
          console.log('Progress: %s complete', percent, concurrent, ips);
        })
        .on('end', function (stats, errorCount) {
          //console.log(stats);
          stats.name = flowModule.name;
          results.flows.push(stats);

          if (++actual === results.flowCount)
            return alldone();
        });

    });
  });

  function alldone() {
    console.log(util.inspect(results, {depth: null, colors: true}));
    joola.beacon.insert('benchmark', results, {}, function (err) {
      if (err)
        throw err;
      process.exit(0);
    });
  }
});