---
layout: doc
title: Configuration
description: Learn how to configure Joola to your needs and scale.
---

Joola uses a node based architecture and all nodes must share the same configuration and respond together to configuration changes. For this purpose, we are using
 [Redis] as a central configuration store.
 
When Joola fires up it tries and locate a configuration file (see below for discovery logic) and load it into the central store if it hasn't been initialized yet.
If it fails, the application will exit.
 Additional nodes joining the cluster must have at least the single setting of the central configuration store to use in order to operate correctly, they'll connect to the central configuration store, load the most current values and respond to any future change.

Configuration parsing and management is done using the [`config`][node-config] module.

# Configuration life-cycle
To support node based clusters, configuration lives in the central configuration store and it is the only source of "truth".
Configuration changes during runtime and these changes are not peristed to local configuration files, but are only kept in the central store.
The local configuration file is simply an initial bootstrap and therefore, it is very common that local configuration differs from central.

Once bootstrapped, changes to configuration are done using the API or by loading newer versions of the configuration files.
If a change in central configuration is detected, all connected nodes are informed and update their configuration to reflect the latest from central store.

## Configuration version
Joola supports an optional `version` attribute as part of the configuration file. This enable a `semver` comparison between the central stored configuration and the local configuration file.
The logic is simple:

- localVersion <= centralVersion = use central configuration.
- localVersion > centralVersion = delete and then write local configuration into central store. All nodes are then informed and update their configuration.

# Configuration discovery
Configuration can be stored/used from either configuration files, environment variables and command line switches.

## Configuration files
Joola reads configuration files stored in the directory specified by the NODE_CONFIG_DIR environment variable, which defaults to the config directory under the process current working directory, `/config`.
Configuration files can be in JavaScript format, JSON format, COFFEE format, or YAML format - whichever you prefer.
Configuration files in the config directory are loaded in the following order:
    default.EXT
    hostname.EXT
    deployment.EXT
    hostname-deployment.EXT
    local.EXT
    local-deployment.EXT

Where EXT can be .yml, .yaml, .coffee, .json, or .js depending on the format you prefer.
hostname is the `$HOST` environment variable if set, otherwise the `$HOSTNAME` environment variable if set, otherwise the hostname found from require('os').hostname().
Once a hostname is found, everything from the first period ('.') onwards is removed. For example, abc.example.com becomes abc
deployment is the deployment type, found in the `$NODE_ENV` environment variable. Defaults to 'development'.

[To learn more about configuration files](http://lorenwest.github.io/node-config/latest/).

## Environment variables
If the `$NODE_CONFIG` environment variable is set, it must be a valid JSON string containing configuration overrides.
These are applied after configuration files have been loaded.

```bash
# This will set the webserver port to 8585
$ export $NODE_CONFIG={"interfaces":{"webserver":{"port":8585}}}
```

Developers can also override specific configuration settings by using the following:

```bash
# This will set the webserver port to 8585
$ export $JOOLA_CONFIG_INTERFACES_WEBSERVER_PORT=8585

# Set MongoDB DSN
$ export JOOLA_STORE_DISPATCH_STOMP_DSN=stomp://guest:guest@127.0.0.1:61613

# Set Stomp DSN
$ export JOOLA_STORE_CACHE_MONGO_DSN=mongodb://localhost:27017/cache
```

## Command line switches
All environment variables described above may also be supplied on the command line.

```bash
$ node Joola.js --NODE_ENV=staging --NODE_CONFIG='{"interfaces":{"webserver":{"port":8585}}}'
```

## Multiple environment configuration
Joola configuration supports overriding default settings with environment speicifc attributes.
Combining these methods allows developers to deploy Joola to different envs/setups while still having complete control over the node's configuration.

```yaml
# Config file (YAML), stored in config/default.yml
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
```

```bash
# Environment variable
# Set Redis host to `lab04`
$ export JOOLA_STORE_CONFIG_REDIS_HOST=lab04

# Then running with 
$ node Joola --store:cache:mongodb:host=lab05

# we have the following configuration applied in runtime
# stores.config.redis.host = lab04
# stores.config.dispatch.stomp.host = lab02
# stores.config.mongodb.host = lab05
```

# Changing configuration during runtime
The best way to apply configuration changes is via the SDK.

```js
joola.config.set('config:key', 'value', function(err) {
  if (err)
    throw err; //or something else
});

joola.config.get('config:key', function(err, value) {
  if (err)
    throw err; //or something else
  console.log('config value', value);
});
```

Configuration keys are accessed by replacing the nested `.` with `:`. So, for example, changing the webserver port:

```js
joola.config.set('interfaces:webserver:port', 8585, function(err) {
  if (err)
    throw err; //or something else
});
```

# Configuration updates
Config files may contain an optional attribute of `version`. While parsing the configuration file, Joola checks if there already a central configuration store setup, if not it will apply the configuration file into it.
If the store already exists, it will check the store's version against the file, if the file has a higher version it will delete the current central configuration store and apply the file into it.

```yaml
# Config file (YAML), stored in config/default.yml
version: 0.1
stores:
  config:
    redis:
      host: lab01
```
Running Joola for the first time will load the above file into the central configuration store, subsequent runs will not alter the store in any way since the versions match.

If we update the config file and **it's version**, the next run will load the newer version into the central store and propagate it to all connected nodes. 

```yaml
# Config file (YAML), stored in config/default.yml
version: 0.2
stores:
  config:
    redis:
      host: lab02
```
Following the update, all nodes will be connecting to `lab02`.

# SSL

## SSL Certificates for Public/Production
You will need to obtain a valid SSL certificate and place it somewhere on the filesystem for Joola to find. 
 
In the configuration file, please set the following values:

```yaml
interfaces:webserver:keyfile = <path-to-your-keyfile>
interfaces:webserver:certfile = <path-to-your-certificate>
```

## SSL Certificates for Local Development
The default installation includes SSL certificates to support `localhost` development. These certificates were produced in our labs and you'd probably need to change them to yours to enable easy development.
It's important to note that the default certificates should not and cannot be used in production to protect your servers, their only purpose is to allow easy development by the community.

To generate your own `localhost` certificates, please follow these guidelines:

```bash
$ penssl genrsa -des3 -out server.key 1024
$ openssl req -new -key server.key -out server.csr

# Then, remove the passphrase from the server certificate for avoiding Apache asking you the password everytime you restart it:
$ cp server.key server.key.org
$ openssl rsa -in server.key.org -out server.key

# And then, generate your self-signed certificate
$ openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

Edit your configuration file to point at these files, same as explained in the topic above.

>
Parts of the above documentation have been copied from the [`config`][node-config] module documentation.

[Redis]: http://redis.io
[node-config]: http://lorenwest.github.io/node-config/latest/
