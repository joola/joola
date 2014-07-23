<a name="top" />

[HOME](Home) > [ABOUT joola](joola-overview) > **TECHNICAL ARCHITECTURE**

joola is a scalable data framework written using [NodeJS][nodejs]. It's designed to provide highly-performing data-in ([beacon](the-beacon-subsystem))/data-out ([query](the-query-subsystem) and [visualiztion](the-sdk-subsystem)) service with advanced caching and analytics functionality.

During the development of joola, we've placed emphasis on the following topics:
- Must work out of the box with zero configuration.
- Minimal dependencies.
- Speed is a must, we aim to serve all queries in under 1 second. 
- Secure! we're dealing with data and due to its sensitivity, each action must have an audit trail and security context.
- Support multi-tenants and offer granular permissions.

In order to support all of the above requirements (and many more), we've built the following framework/stack:
![http://i.imgur.com/cDAnBLd.png](http://i.imgur.com/cDAnBLd.png)

## The Framework's Stack
Our stack is designed to gain from nodejs performance and ease-of-use. Whenever possible, we've built on the work of others and tried to steer away from re-inventing the wheel.
Each of the sub-systems listed in the figure shown above has a dedicated topic in [other sections](technical-documentation#subsystems) of this wiki.

You can access the framework's stack in several ways, be it directly on the server console or via the Javascript SDK's. For specific details and tutorials, please refer to the [[Technical-Documentation]] where these are covered. 

[**Learn more about the stack**](architecture)

## Cache Stores
joola uses 3rd party, reliable software to act as its cache store. We aim to support multiple, different store types to allow developers and users more flexibility, but for now our main and only cache store is [MongoDB][mongodb].
The NoSQL data architecture that we've chosen for our cache stores allows not only a flexible store, but also scalability currently not supported (out-of-the-box) with traditional RDBMs systems.

In addition to MongoDB, joola also uses [Redis][redis] for both configuration storage and providing the pub/sub mechanism that our [Dispatch Subsystem](the-dispatch-subsystem) relies on.  

joola provides a wrapper to the cache stores and no direct work or knowledge is required. We just need to have MongoDB and Redis installed for the framework's use.

[**Learn more about cache stores**](install-joola)

## Pushing Data
Pushing data is easy, very easy. There are almost no restrictions or preparations you need to do.  
After you [setup the server](setup-joola) and everything checks out fine.

```js
var joola = require('joola.sdk');

joola.init({host: 'https://localhost:8081', APIToken: 'apitoken-demo'}, function(err) {
  if (err)
    throw err;
  
  var document = {
    timestamp: new Date(),
    attribute: 'I\'m an attribute',
    value: 123
  };
  joola.beacon.insert('collection-name', document, function(err) { 
    if (err)
      throw err;
      
    console.log('Document saved');
  });
});
```

We now have a new collection defined with the name `collection-name` and it contains a single document (described above).

[**Learn more about beacon and pushing your data**](pushing-data)

## Consuming Analytics and Visualization
```js
var joola = require('joola.sdk');

joola.init({host: 'https://localhost:8081', APIToken: 'apitoken-demo'}, function(err) {
  if (err)
    throw err;

  joola.query.fetch({metrics: ['value']}, function(err, result){
    if (err)
      throw err;
      
    console.log('We have some results', result);
  });
  
  joola.viz.timeline({container: $('#drawhere'), query: {dimensions:['timestamp'], metrics: ['value']}}, function(err, result){
    if (err)
      throw err;
      
    console.log('We now have a timeline drawn on the webpage', result);
  });
});
```

At the end of the script execution we'll have a document collection (of a single document) with the sum of `123`.

[**Learn more about data analytics and visualizations**](https://github.com/joola/joola/wiki/sdk-api-documentation#joolaviz)


[nodejs]: http://nodejs.org
[mongodb]: http://www.mongodb.com
[redis]: http://redis.io