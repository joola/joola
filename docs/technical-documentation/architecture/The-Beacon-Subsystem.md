[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [ARCHITECTURE](architecture) > **BEACON**

Beacon is the framework's data collector. 
When we wish to store new data in joola's [Datastore](the-datastore-subsystem), then we use `beacon` for storing it.

A basic example looks something like this:
```js
//this example will push a new event whenever a mouse moves on a web page.
$(document).mousemove(function (event) {
  joola.beacon.insert('mousemove', {
    timestamp: new Date(),
    x: event.pageX,
    y: event.pageY,
    moves: 1
  });
});
```

In the example above, `beacon` uses the defined collection of **mousemove** to map the different dimensions and 
metrics sent. Data is stored in an easy-to-fetch structure within its internal cache and once data is stored, 
it's available for queries immediately.

```js
//basic query for getting a sum of moves over the last 30 minutes 
joola.query.fetch({
  timeframe:'last_30_minutes',
  interval: 'second',
  dimensions: ['timestamp'],
  metrics: ['moves'],
  collection: 'mousemoves',
  filter: null
}, function(err, results) {
  if (err)
    throw err;
    
  console.log(results);
});
```

## High-Availability
Beacon is designed to provide high-availability for incoming data and supports processing of document arrays. 