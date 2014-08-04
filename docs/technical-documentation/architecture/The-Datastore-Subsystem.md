[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [ARCHITECTURE](architecture) > **DATASTORE**

joola uses a datastore to support its need for storing documents, querying, analyzing, etc...
We've designed joola so it is agnostic to the datastore provider, it uses a logical layer that exposes API endpoints for pushing documents ([beacon](the-beacon-subsystem)) and querying analytics ([query](the-query-subsystem)).

These are the current datastore providers joola supports:
- [MongoDB](http://github.com/joola/joola.datastore-mongodb)
- [influxDB](http://github.com/joola/joola.datastore-influxdb)

There's a wealth of datastore providers, ranging from Google Datastore to influxdb. We invite the community to contribute plugins to extend the support of joola.

### Datastore Plugins
Extending joola with additional datastore plugins is not an overly complex task. The framework supports easy integration of additional plugins.

##### Install the plugin
When joola boots, it tries to load all relevant datastore plugins and initialize them. Discovery of datastores is done by inspecting configuration under the `store:datastore` key.
  Each datastore found is initialized by requiring the plugin `require('joola.datastore-<datastorename>')`. If the plugin is not installed, an error is shown and the boot is terminated.

For this example, we'll use the `joola.datastore-mongodb` plugin.

```bash
$ npm install joola.datastore-mongodb
```

##### Add to configuration
```yaml
store:
  datastore:
    mongodb:
      dsn: mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
```

When you'll run joola, it will attempt to `require('joola.datastore-mongodb')` and then initialize it with the dsn provided in the configuration.

### Writing Plugins
In order to allow communication between joola and the plugin it's required for the plugin to follow strict guidelines and syntax.

 We have created a template repository named [joola.datastore-template](http://github.com/joola/joola.datastore-template). Please fork this repository to use as the basis for the plugin you are about to develop.
 The template implements all required exports for communication back and forth between joola and your plugin.

 A working example is the [joola.datastore-mongodb](http://github.com/joola/joola.datastore-mongodb) provider plugin.
