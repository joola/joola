function getStats(key, container, sumcontainer) {
  joolaio.io.socket.on('stats:events', function (stats) {
    var arr = [];
    var titles = [];
    var sum = 0;
    $.each(stats[key], function (item) {

      if (stats[key][item][1] != null) {
        arr.push(stats[key][item][1]);
        sum += stats[key][item][1];
      }
      else
        arr.push(0);
      titles.push(new Date(stats[key][item][0] * 1000))
    });
    $('#' + sumcontainer).text(sum);
    //console.log(stats['stats:events:upstarts'])
// Draw a sparkline for the #sparkline element
    $('#' + container).sparkline(arr, {
      type: "line",
      width: 150,
      tooltipSuffix: " upstart events"
    });
  });
}
/*
getStats('stats:events:dummy:counter', 'sparkline', 'dummySum');
getStats('stats:events:dummy2:counter', 'sparkline2', 'dummySum2');
getStats('stats:events:dummy3:counter', 'sparkline3', 'dummySum3');
getStats('stats:events:dummy4:counter', 'sparkline4', 'dummySum4');*/