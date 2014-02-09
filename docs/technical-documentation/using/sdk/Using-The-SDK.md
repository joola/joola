[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [USING](using-joola.io) > **JOOLA.IO SDK**

joola.io offers a complete SDK written in Javascript. 

## Step 1: Include/require the SDK
In order to use the SDK, you will first need to include it in either a webpage or a NodeJS package.  

Since the SDK connects to a joola.io node, we need to have a running node of joola.io, for this walkthrough, 
we're going to assume you will be using your localhost for running the node, i.e. `http://localhost:8080`. 

For installation instructions, please refer to [Installing joola.io](install-joola.io).

#### Including joola.io SDK in a Webpage

Create a webpage anywhere you wish and edit it to look something like below.

```html
<script src="http://localhost:8080/joola.io.js"></script>

<script>
  console.log('joola.io object is:', joolaio);
</script>
```

Open the html page we just created in your webbrowser and check out the console, 
you'll notice the console.log containing the `joolaio` object.

#### Using joola.io SDK from NodeJS
For this walkthrough, we'll be using a standalone version of the SDK as in most cases dictate. 

First, we install the library.
```bash
$ mkdir /tmp/joola.io-sdk-example
$ cd /tmp/joola.io-sdk-example
$ npm install http://github.com/joola/joola.io.sdk/tarball/develop
$ nano joola.io-sdk-example.js
```

We proceed to require it.
```js
var joolaio = require('joola.io.sdk');

console.log('joola.io object is:', joolaio);
```

Lastly we execute our simple js file.
```bash
$ node /tmp/joola.io-sdk-examples
```

## Step 2: Initialize and Authenticate
From this point onward, usage is the same regardless of the manner you included/required the SDK.

Before we can execute commands against the SDK, we need to initialize it.
During this process we will instruct the SDK what [Security token](security-and-authentication) it should use. If 
authentication completes successfully, then the SDK will be immediately ready for use.

This example shows how we can produce a token client-side.
```js
var options = {
  host: 'https://localhost:8081'
};

joolaio.init(options, function (err, result) {
    if (err)
        throw err;
    joolaio.users.authenticate('organization', 'user', 'password', function (err, token) {
        joolaio.TOKEN = token._;
        
        //joola.io is now ready for work, event `core.ready` is emitted
    });
});
```

In this example, the page/module receives the token in advance.
```js
var options = {
  host: 'http://localhost:8080',
  token: 'token-1234'
}
joolaio.init(options, function(err){
  if (err)
    throw err;
    
  console.log('joola.io is ready for work');
});
```

In this example, the page/module will be using an APIToken.
```js
var options = {
  host: 'http://localhost:8080',
  APIToken: '12345'
}
joolaio.init(options, function(err){
  if (err)
    throw err;
    
  console.log('joola.io is ready for work');
});
```

If you prefer, you can employ another possible approach for initializing joola.io and wait on [event](the-sdk-subsystem#event-driven) stating the system is ready 
for operation.
```js
joolaio.events.on('core.ready', function(){
  console.log('joola.io is ready for work');
});

var options = {
  host: 'http://localhost:8080',
  token: 'token-1234'
}
joolaio.init(options);
```

[Learn more about using Security Tokens](security-and-authentication)
## Step 3: Using the SDK
The SDK allows you to control all aspects of the framework, so you'll find an API call for everything you need. 
These include the management aspects of the framework, such as adding organizations, users and assigning roles and permissions.
  The SDK is used to push data in and query data out of joola.io, the flexibility of the SDK coupled with its developer oriented design make it an easy-to-use tool. 

Here's a short list of different examples relevant to the SDK. If you wish to learn more about the SDK and its functionality, please refer to its docs.

- Pushing data
- Query, analytics and visualization
- Collections and meta data
- Manage Organizations, users and roles
- System health and stats

## Step 3: Use
Now that we have the SDK initialized with a security context, we can start communicating events, 
query for insight and manage the different framework aspects.

For example, let's query the system:
```js
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
```

Another basic example would be to list all available collections in the system:
```js
joolaio.collections.list(function(err, collections) {
  if (err)
    throw err;
    
  console.log('Collections', collections);
});
```

## What's next?
