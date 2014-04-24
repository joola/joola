[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [USING](using-joola.io) > **CONFIGURATION**

joola.io is designed to allow developers to easily setup and control their configuration.
   
### Central Configuration Store
joola.io has a node based architecture, meaning that all nodes must share the same configuration and respond together to configuration changes. For this purpose, we are using 
 Redis as a central configuration store. 
 
When joola.io runs for the first time it will try and locate a configuration file (see below for discovery logic) and load it into the central store (Redis). If it fails, the application will exit.
 Additional nodes joining the cluster must have a single setting of the configuration store to use in order to operate correctly, they'll connect to the central configuration store, load its values and respond to any future change.
 
### Configuration Discovery
Configuration can be stored/used in multiple ways: configuration file, run switches and environment variables.
The order of load is:
- Switches
- Environment variable
- Configuration file

```
# Config file (YAML), stored in config/baseline.yml
stores:
  config:
    redis:
      host: lab01
  dispatch:
    stomp:
      host: lab02
  cache:
    mongodb:
      host: lab03
 
# Environment variable
$ export JOOLA_STORE_CONFIG_REDIS_HOST=lab04

# Then running with 
$ node joola.io --store:cache:mongodb:host=lab05

# we have the following configuration applied in runtime
# stores.config.redis.host = lab04
# stores.config.dispatch.stomp.host = lab02
# stores.config.mongodb.host = lab05
```

Combining the above methods allows developers to deploy joola.io to different envs/setups while still having complete control over the node's configuration.

### Changing Configuration in Runtime
```js
joolaio.config.set('config:key', 'value', function(err) {
  if (err)
    throw err; //or something else
});

joolaio.config.get('config:key', function(err, value) {
  if (err)
    throw err; //or something else
  console.log('config value', value);
});
```

### Updating Configuration via Config File
Config files may contain an optional attribute of `version`. While parsing the configuration file, joola.io checks if there already a central configuration store setup, if not it will apply the configuration file into it.
If the store already exists, it will check the store's version against the file, if the file has a higher version it will delete the current central configuration store and apply the file into it.
```
# Config file (YAML), stored in config/baseline.yml
version: 0.1
stores:
  config:
    redis:
      host: lab01
```
Running joola.io for the first time will load the above file into the central configuration store, subsequent runs will not alter the store in any way since the versions match.

If we update the config file and **it's version**, the next run will load the newer version into the central store and propagate it to all connected nodes. 
```
# Config file (YAML), stored in config/baseline.yml
version: 0.2
stores:
  config:
    redis:
      host: lab02
```
Following the update, all nodes will be connecting to `lab02`.