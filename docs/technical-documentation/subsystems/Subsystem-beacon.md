Beacon is the framework's data collector. 
When we wish to store new data in joola.io's cache, then we use `beacon` for storing it.

A basic example looks something like this:
```js
//this example will push a new event whenever a mouse moves on a web page.
$(document).mousemove(function (event) {
  joolaio.beacon.insert('mousemove', {
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
joolaio.query.fetch({
  timeframe:'last_30_minutes',
  interval: 'second',
  dimensions: ['timestamp'],
  metrics: ['moves'],
  filter: null
}, function(err, results) {
  if (err)
    throw err;
    
  console.log(results);
});
```