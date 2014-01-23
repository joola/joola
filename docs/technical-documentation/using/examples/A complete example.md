[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [Examples](examples) > **A COMPLETE EXAMPLE**

In this example we'll be creating a complete flow of reporting new events and then displaying them in a timeline 
chart. All of this can be done with a single webpage.

Before starting, please make sure you cover the [installing joola.io] section and that your system is up and running.
 We'll be assuming that you'll be running on `http://localhost:8080`.
 
This example is also available as a [gist](https://gist.github.com/itayw/8575664).

```html
<html>
<head>
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
  <script src="http://localhost:8080/3rd/highcharts/highcharts.3.0.2.js"></script>
  <script src="http://localhost:8080/joola.io.js"></script>
</head>
<body>
<h3>joola.io Documentation</h3>

<h2>Examples</h2>

<h1>A complete example</h1>
<hr>
<div id="chart"></div>
</body>
<script>
  var options = {
    host: 'http://localhost:8080',
    isBrowser: true
  };

  joolaio.init(options, function (err) {
    if (err)
      throw err;
    joolaio.users.authenticate('admin', 'password', function (err, token) {
      if (err)
        throw err;
      joolaio.TOKEN = token._;
    });
  });

  joolaio.events.on('core.ready', function () {
    console.info('joola.io SDK ready, version: ' + joolaio.VERSION + ', token: ' + joolaio.TOKEN);
    return getAddCollection(function (err, collection) {
      if (err)
        throw err;
      console.log('We have a collection', collection);

      setupChart();

      //now we start pushing events as they arrive
      var lastTimestamp = new Date();
      var moves = 0;
      var timer = 0;
      $(document).mousemove(function (event) {
        if (timer) {
          clearTimeout(timer);
          moves++;
        }

        timer = setTimeout(function () {
          joolaio.beacon.insert('example', {
            timestamp: new Date(),
            x: event.pageX,
            y: event.pageY,
            moves: moves
          });
          lastTimestamp = new Date();
          moves = 0;
        }, 10);
      });
    });
  });

  function getAddCollection(callback) {
    var newCollection = {
      id: 'example',
      name: 'A complete example',
      description: 'This is a collection for the A complete example document.',
      type: 'data',
      dimensions: {
        timestamp: {
          id: 'timestamp',
          name: 'Date',
          mapto: 'timestamp'
        },
        x: {
          id: 'x',
          name: 'X Position',
          type: 'string'
        },
        y: {
          id: 'y',
          name: 'Y Position',
          type: 'string'
        }
      },
      metrics: {
        moves: {
          id: 'moves',
          name: 'Move Count',
          type: 'int',
          aggregation: 'sum'
        }
      }
    };

    joolaio.collections.get(newCollection.id, function (err, collection) {
      if (err)
        return joolaio.collections.add(newCollection, callback);

      return callback(null, collection);
    });
  }

  function setupChart() {
    var $chart = $('#chart');

    var query = {
      timeframe: 'last_30_minutes',
      interval: 'second',
      dimensions: ['timestamp'],
      metrics: ['moves'],
      filter: null,
      realtime: true
    };
    var options = {
      query: query
    };

    $chart.Timeline(options);
  }
</script>
</html>
```