Beacon is the framework's event collector. When we wish to store new data in joola.io's cache, then we use `beacon` for storing it.

A basic example looks something like this:
```js
  $(document).mousemove(function (event) {
    joolaio.dispatch.beacon.insert('mousemove', {
    	timestamp: new Date(),
    	x: event.pageX,
    	y: event.pageY
		});
  });
```

Beacon uses the defined collection of **mousemove** to map the different dimensions and metrics sent and stores the data in an easy-to-fetch structure within its internal cache.
Once the data is stored, it's available for queries immedietley.