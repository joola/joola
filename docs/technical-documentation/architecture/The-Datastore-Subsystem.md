[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [ARCHITECTURE](architecture) > **DATASTORE**

joola.io uses a datastore to support its need for storing documents, querying, analyzing, etc...
We've designed joola.io so it is agnostic to the datastore provider, it uses a logical layer that exposes API endpoints for pushing documents ([beacon](the-beacon-subsystem)) and querying analytics ([query](the-query-subsystem)).

These are the current datastore providers joola.io supports:
- [MongoDB](http://github.com/joola/joola.io.datastore-mongodb)

There's a wealth of datastore providers, ranging from Google Datastore to influxdb. We invite the community to contribute plugins to extend the support of joola.io.

### Datastore Plugins
Extending joola.io with additional datastore plugins is not an overly complex task. The framework supports easy integration of additional plugins.

##### Install the plugin
When joola.io boots, it tries to load all relevant datastore plugins and initialize them. Discovery of datastores is done by inspecting configuration under the `store:datastore` key.
  Each datastore found is initialized by requiring the plugin `require('joola.io.datastore-<datastorename>')`. If the plugin is not installed, an error is shown and the boot is terminated.

For this example, we'll use the `joola.io.datastore-mongodb` plugin.

```bash
$ npm install joola.io.datastore-mongodb
```

##### Add to configuration
```yaml
store:
  datastore:
    mongodb:
      dsn: mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
```

When you'll run joola.io, it will attempt to `require('joola.io.datastore-mongodb')` and then initialize it with the dsn provided in the configuration.

### Writing Plugins
In order to allow communication between joola.io and the plugin it's required for the plugin to follow strict guidelines and syntax.

 We have created a template repository named [joola.io.datastore-template](http://github.com/joola/joola.io.datastore-template). Please fork this repository to use as the basis for the plugin you are about to develop.
 The template implements all required exports for communication back and forth between joola.io and your plugin.

 A working example is the [joola.io.datastore-mongodb](http://github.com/joola/joola.io.datastore-mongodb) provider plugin.

 The template is rich with comments to support your development, please feel free to submit pull-request to the template repository with additional know-how, examples and comments to support the community development.

#### Exports

The following exports are needed from each plugin. The template includes more in-depth comments relevant to each export.

###### `init`

###### `destroy`

###### `openConnection`

###### `closeConnection`

###### `checkConnection`

###### `insert`

###### `find`

###### `delete`

###### `update`

###### `query`

###### `drop`

###### `purge`
