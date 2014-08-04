[**HOME**](Home) > **TECHNICAL DOCUMENTATION**

Review of joola architecture, know-how and detailed breakdown of internal processes.

- [Setup joola](setting-up-joola)
- [Architecture](architecture)
- [[Basic concepts]]
- [API Documentation](api-documentation)
- [SDK Documentation](sdk-api-documentation)
- [The development process](the-development-process)

Following installation, point your browser to `https://localhost:8081` to view the Welcome Page and start using the framework.

## Getting Started

Here's a quick guide on getting started with joola post installation.

##### Pushing your first event

Using cURL:
```bash
$ curl \
     --include \
     --request POST \
     --header "Content-Type: application/json" \
     --data-binary "[{
       \"timestamp\": null,
       \"article\": \"Sample Analytics\",
       \"browser\": \"Chrome\",
       \"device\": \"Desktop\",
       \"engine\": \"Webkit\",
       \"os\": \"Linux\",
       \"userid\": \"demo@joo.la\",
       \"ip\": \"127.0.0.1\",
       \"referrer\": \"http://joo.la\",
       \"visits\": 1,
       \"loadtime\": 123
     }]" \
     https://localhost:8081/beacon/{workspace}/{collection}{?APIToken}
```

Using the SDK:
```js
var joola = require('joola.sdk');

joola.init({host: 'https://localhost:8081', APIToken: 'apitoken-beacon'}, function(err) {
  var doc = {
    "timestamp": null,
    "article": "Sample Analytics",
    "browser": "Chrome",
    "device": "Desktop",
    "engine": "Webkit",
    "os": "Linux",
    "userid": "demo@joo.la",
    "ip": "127.0.0.1",
    "referrer": "http://joo.la",
    "visits": 1,
    "loadtime": 123
  };
  joola.beacon.insert('collection-name', doc, function(err) { 
    console.log('Document saved');
  });
});
```

[**Learn more about pushing data**](http://github.com/joola/joola/wiki/pushing-data)

##### Your first visualization
```html
<script src="https://localhost:8081/joola.js?APIToken=apitoken-demo"></script>
<script>
joola.events.on('ready', function(err) {
  if (err)
    throw err;
    
  var options = {
    caption: 'Visits over Time',
    query: {
      timeframe: 'last_hour',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['visits'],
      collection: 'collection-demo'
    }
  }
  $('<div></div>').Timeline(options).appendTo('body');
});
</script>
```

[**Learn more about analytics and visualizations**](https://github.com/joola/joola/wiki/sdk-api-documentation#joolaviz)
