[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [ARCHITECTURE](architecture) > **WEBSERVER**

joola's prvoides a RESTful API interface which is based on [[ExpressJS]].

The webserver supports clustering, meaning that multiple processes can share the HTTP(s) ports. This is managed automatically by NodeJS `cluster`.
However, there are common situations in which an additional node running on the same machine will not be able to bind on the already open port. This will not throw an
error since it's a common scenario, for example, start 8 nodes in a cluster to deal with HTTP requests and Dispatch and additional 8 to deal strictly with Dispatch.

If you wish to start a node while ensuring that it will have a webserver running and if not throw an exception, use the `--webserver` switch. This will force the node to throw an error in case the webserver could not be started.

## Request Routing
>
**This is currently under developers review and subject to change**.

joola uses [ExpressJS] as its Web Application Framework, it provides an easy to operate and manage schema.
This is the logical flow of an API request:
```
- Request hits web server
- Router parses the request according to query path
-- If static resource then it's served
-- If SDK then it's served from local FS after replacing the security token
-- If API call, i.e. `/api/collections/list`
--- Authentication middleware kicks in
--- Checks the security tokens
--- Checks that the route is valid and that the user has permission to it
--- Checks that all required (and optional) params are passed
---- If pass then request is processed by the appropriate function, i.e. `/lib/dispatch/collections#list`
---- If fails, return 401 with reason
- If an error occurs during a step of the process, then a 500 error is returned.
```

### Dynamic routing, permissions and parameters
While designing the framework's routing we needed the following abilities:
- The node receiving and replying to the request may not be the one executing the logic.
- API endpoints need to include permission metadata, i.e. collections/list is ok to be executed by admin, but not a normal user.
- API endpoints need to filter parameters. In order to increase system security, each API endpoint must specify what required and optional parameters it accepts.
- Flexibility to do whatever we want and need for specific API endpoints.

In order to achieve the above we have introduced the following structure.
```js
exports.fetch = {
  name: "/api/query/fetch",
  description: "I fetch stored data according to the options provided.",
  inputs: ['options'],
  _outputExample: {},
  _permission: ['access_system'],
  _dispatch: {
    message: 'query:fetch'
  },
  _route: function (req, res) {},
  run: function (context, options, callback) {}
}
```
The above signature can be found in each of the files under `lib/dispatch/`. Upon load the framework process the files and builds stubs that link between ExpressJS router and the relevant endpoint. Each endpoint contain a few meta descriptors to allow this:

- `name` of the API endpoint, it must be in the form of the exact url path.
- `description` contains a textual description of the API endpoint.
- `inputs` can be either an `array` of strings, each for a parameter or it can be an `object` of the following form:
```js
inputs: {
  required: ['options'],
  optional: ['optionalParam']
}
```
- `outputExample` contains a JSON representation of a possible result.
- `permission` is an `array` of `permissions` that allow access to this resource.
- `dispatch` contains a string `message` that is used to determine the MQ that will manage the dispatch of this kind of messages.
- `_route` an optional function to execute when routing the message.
- `run` the actual function to run when this API endpoint is called, it has the following signature:
```js
function (context, options, callback) {
  //context is passed by dispatch and contains the security and other context details.
  //options is passed by the caller using the router
  //callback is placed by dispatch and communicate the result back via MQ
}
```



[ExpressJS]: http://expressjs.com