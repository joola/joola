[HOME](Home) > [SDK](sdk) > **SECURITY AND AUTHENTICATION**

Before we can execute commands using the SDK, we need to initialize it and authenticate.
During this process we will instruct the SDK what security context it should use. If authentication completes successfully, then the SDK will be immediately ready for use. If authentication fail and error will be thrown or passed to the callback.

This example shows how we can produce a authenticate using plaintext on the client-side.
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

## Generating Tokens Server-Side

For your app to be secure, you must ensure that sensitive tokens are never generated client-side. For this purpose, using the REST API, you can create a token on behalf of a user and communicate the secure token to the webpage for usage.

[Learn more about SSO and Token Generation](https://github.com/joola/joola/wiki/api-documentation#generate-token-post)

### What's next?

- [Getting and using the SDK](using-the-sdk)
- **Security and authentication**
- [Pushing data](pushing-data)
- [Query, analytics and visualization](https://github.com/joola/joola/wiki/sdk-api-documentation#joolaviz)
- [Collections and meta data](collections)
- [Workspaces, users and roles](basic-concepts)
- [Complete API documentation](sdk-api-documentation)