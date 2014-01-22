[HOME](Home) > [USING](using-joola.io) > **JOOLA.IO SDK**

joola.io offers a complete SDK written in Javascript. 

## Step 1: Include/require the SDK
In order to use the SDK, you will first need to include it in either a webpage or a NodeJS package.  

Since the SDK connects to a joola.io node, we need to have a running node of joola.io, for this walkthrough, 
we're going to assume you will be using your localhost for running the node, i.e. `http://localhost:8080`. 

For installation instructions, please refer to [[Installing joola.io]].

#### Including joola.io SDK in a Webpage

Create a webpage anywhere you wish and edit it to look something like below.

```html
<script src="http://localhost:8080/joola.io.js"></script>

<script>
  console.log('joola.io object is:', joolaio);
</script>
```

#### Using joola.io SDK from NodeJS
For this walkthrough, we'll be using a standalone version of the SDK as in most cases dictate. 

First, we install the library.
```bash
$ mkdir /tmp/joola.io-sdk-example
$ cd /tmp/joola.io-sdk-example
$ npm install http://github.com/joola/joola.io/tarball/develop
$ nano joola.io-sdk-example.js
```

We proceed to require it.
```js
var joolaio = require('joola.io').sdk;

console.log('joola.io object is:', joolaio);
```

Lastly we execute our simple js file.
```bash
$ node /tmp/joola.io-sdk-examples
```

## Step 2: Initialize
From this point onward, usage is the same regardless of the manner you included/required the SDK.

Before we can execute commands against the SDK, we need to initialize it.
During this process we will instruct the SDK what Security token (context) it should use. If authentication completes
 successfully, then the SDK will be immediately ready for use.

```js
joolaio.init({token: 'token-1234'}, function(err){
  if (err)
    throw err;
    
  console.log('joola.io is ready for work');
});
```

## Step 3: Use
Now that we have the SDK initialized with a security context, we can start communicating events, 
query for insight and manage the different framework aspects.

For example, let's query the system:
```js
joolaio.init({token: 'token-1234'}, function(err) {
  if (err)
    throw err;
    
  var query = {
                timeframe:'last_30_minutes',
                interval: 'second',
                realtime: true,
                dimensions: ['timestamp'],
                metrics: ['x', 'y'],
                filter: null
              };
              
  joolaio.query.fetch({query: query}, function(err, results) {
    if (err)
      throw err;
      
    console.log('Query results', results);
  });
});
```
