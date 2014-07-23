[HOME](Home) > [SDK](sdk) > **GETTING AND USING THE SDK**

## Step 1: Include/require the SDK
In order to use the SDK, you will first need to include it in either a webpage or a NodeJS package.  

Since the SDK connects to a joola node, we need to have a running node of joola, for this walkthrough, 
we're going to assume you will be using your localhost for running the node, i.e. `https://localhost:8081`. 

For installation instructions, please refer to [Installing joola](install-joola).

#### Including joola SDK in a Webpage

Create a webpage anywhere you wish and edit it to look something like below.

```html
<script src="https://localhost:8081/joola.js"></script>

<script>
  console.log('joola object is:', joola);
</script>
```

Open the html page we just created in your webbrowser and check out the console, 
you'll notice the console.log containing the `joola` object.

#### Using joola SDK from NodeJS
For this walkthrough, we'll be using a standalone version of the SDK as in most cases dictate. 

First, we install the library.
```bash
$ mkdir /tmp/joola-sdk-example
$ cd /tmp/joola-sdk-example
$ npm install http://github.com/joola/joola.sdk/tarball/develop
$ nano joola-sdk-example.js
```

We proceed to require it.
```js
var joola = require('joola.sdk');

console.log('joola object is:', joola);
```

Lastly we execute our simple js file.
```bash
$ node /tmp/joola-sdk-examples
```

## Step 2: Initialize and Authenticate
From this point onward, usage is the same regardless of the manner you included/required the SDK.

Before we can execute commands using the SDK, we need to initialize it.
During this process we will instruct the SDK what [Security token](security-and-authentication) it should use. If 
authentication completes successfully, then the SDK will be immediately ready for use.

This example shows how we can produce a token client-side.
```js
var options = {
  host: 'https://localhost:8081'
};

joola.init(options, function (err, result) {
    if (err)
        throw err;
    joola.users.authenticate('organization', 'user', 'password', function (err, token) {
        joola.TOKEN = token._;
        
        //joola is now ready for work, event `core.ready` is emitted
    });
});
```

In this example, the page/module receives the token in advance.
```js
var options = {
  host: 'https://localhost:8081',
  token: '123456abcdef'
}
joola.init(options, function(err){
  if (err)
    throw err;
    
  console.log('joola is ready for work');
});
```

In this example, the page/module will be using an APIToken.
```js
var options = {
  host: 'https://localhost:8081',
  APIToken: 'apitoken-demo'
}
joola.init(options, function(err){
  if (err)
    throw err;
    
  console.log('joola is ready for work');
});
```

[Learn more about using Security Tokens](security-and-authentication)

## Step 3: Using the SDK
The SDK allows you to control all aspects of the framework, so you'll find an API call for everything you need. 
These include the management aspects of the framework, such as adding organizations, users and assigning roles and permissions.
  The SDK is used to push data in and query data out of joola, the flexibility of the SDK coupled with its developer oriented design make it an easy-to-use tool. 

Here's a short list of different examples relevant to the SDK. If you wish to learn more about the SDK and its functionality, please refer to its docs.

- [Security and Authentication](security-and-authentication)
- [Pushing data](pushing-data)
- [Query, analytics and visualization](https://github.com/joola/joola/wiki/sdk-api-documentation#joolaviz)
- [Collections and meta data](collections)
- [Manage Organizations, users and roles](basic-concepts)