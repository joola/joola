var Crawler = require("simplecrawler");

var total = 0;
var ok = 0;
var error = 0;
Crawler.crawl("http://localhost:4000")
  .on("fetchstart", function (queueItem) {
    total++;
  })
  .on("fetchcomplete", function (queueItem) {
    ok++;
    //console.log("Completed fetching resource:",queueItem.url);
  }).on('fetch404', function (queueItem, response) {
    error++;
    console.log(queueItem.referrer, queueItem.url);
  }).on('complete', function () {
    console.log('Done.');
    console.log('Total: '+total);
    console.log('OK: '+ok);
    console.log('Error: '+error);
    if (error > 0)
      process.exit(1);
    else
      process.exit(0);
  });