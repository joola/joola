/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  joola = require('../joola'),
  zookeeper = require('node-zookeeper-client'),
  _ = require('underscore'),
  semver = require('semver'),
  async = require('async'),
  path = require('path');

var config = exports;

if (process.env.PORT)
  process.env.JOOLA_CONFIG_INTERFACES_WEBSERVER_PORT = process.env.PORT;
process.env.NODE_CONFIG_PERSIST_ON_CHANGE = 'N';

config.overrideWithEnvironment = function () {
  var configIdentifier = 'JOOLA_CONFIG_';
  var joolaEnvironmentVars = {};
  Object.keys(process.env).forEach(function (key) {
    if (key.substring(0, configIdentifier.length) === configIdentifier) {
      joolaEnvironmentVars[key.replace(configIdentifier, '').replace(/_/ig, '.').toLowerCase()] = process.env[key];
    }
  });
  if (joolaEnvironmentVars) {
    Object.keys(joolaEnvironmentVars).forEach(function (key) {
      var value = joolaEnvironmentVars[key];
      if (['true', 'false'].indexOf(value) > -1)
        value = value === 'true';

      joola.logger.warn('Setting environment varialbe for configuration [' + key + ']: ' + value);
      joola.common.flatGetSet(config._config, key, value);
    });
  }
};

config.init = function (callback) {
  config.initialized = false;
  //base config object, following the require config has been parsed and available for the local node. May differ from central.
  config._config = require('config');
  config.zversion = 0;
  config.path = '/JOOLA/' + joola.UID;
  var zConnectionString = config._config.store.config.zookeeper.connectionString || 'localhost:2181';
  config.zookeeper = zookeeper.createClient(zConnectionString, {
    sessionTimeout: 5000,
    spinDelay: 1000,
    retries: 0
  });
  config.initialized = false;
  config.zookeeper.on('state', function (state) {
    switch (state) {
      case zookeeper.State.SYNC_CONNECTED:
        if (!config.initialized) {
          config.initialized = true;
          config.onconnected(callback);
        }
        else
          config.onconnected(function () {
          });
        break;
      case zookeeper.State.DISCONNECTED:
        config.ondisconnected();
        break;
      case zookeeper.State.EXPIRED:
        config.onexpired();
        break;
      default:
        break;
    }
  });
  joola.logger.info('Connecting to Zookeeper...');
  config.zookeeper.connect();
};

config.onconnected = function (callback) {
  joola.state.set('configuration', 'working', 'zookeeper connected.');
  config.zookeeper.create('/JOOLA', new Buffer(JSON.stringify(config._config)), zookeeper.ACL.OPEN_ACL_UNSAFE, zookeeper.CreateMode.PERSISTANT, function (err) {
    if (err) {
      //we already have a central node
      joola.logger.info('Found a central configuration node.');
    }
    else {
      //we didn't have a central node
      joola.logger.info('Created a central configuration node.');
    }

    config.zookeeper.create(config.path, new Buffer(joola.nodeState()), zookeeper.ACL.OPEN_ACL_UNSAFE, zookeeper.CreateMode.EPHEMERAL, function (err) {
      if (err)
        return callback(err);
      joola.logger.debug('Registered zookeeper node @ ' + config.path);
    });
  });

  //first of all wipe any left behind configuration.
  joola.common.extend(exports, config._config);
  config.storeVersion(function (err, storeVersion) {
    if (err)
      return callback(err);

    var fileVersion = config.get('version') || '0.0.0';
    if (storeVersion) {
      //we have an existing config
      if (semver.gt(fileVersion, storeVersion)) {
        //we need to replace the existing version
        joola.logger.warn('Found an out-dated central configuration store with version [' + storeVersion + '], updating to version [' + fileVersion + '].');

        config.storePopulate(config._config, function (err) {
          if (err)
            return callback(err);
          //store is now populated with local copy

          joola.events.emit('config:done');
          return callback(null);
        });
      }
      else if (semver.eq(fileVersion, storeVersion)) {
        joola.logger.info('Found a valid configuration store with version [' + fileVersion + '].');
        config.localApply(fileVersion, function (err) {
          if (err)
            return callback(err);

          joola.events.emit('config:done');
          return callback(null);
        });
      }
      else {
        joola.logger.info('Found an out-dated local configuration with version [' + fileVersion + '].');
        //we need to override local configuration with central
        config.localApply(storeVersion, function (err) {
          if (err)
            return callback(err);

          joola.events.emit('config:done');
          return callback(null);
        });
      }
    }
    else {
      //we have an empty store, let's populate it
      joola.logger.info('Found an empty store, populating with version [' + fileVersion + '].');
      config.overrideWithEnvironment();
      config.storePopulate(config._config, function (err) {
        if (err)
          return callback(err);
        //store is now populated with local copy
        joola.events.emit('config:done');
        return callback(null);
      });
    }
  });
};

config.ondisconnected = function () {
  joola.logger.warn('Disconnected from zookeeper, taking system offline.');
  joola.state.set('configuration', 'failure', 'Zookeeper disconnected.');
};

config.onexpired = function () {
  joola.logger.warn('Zookeeper session expired, taking system offline.');
  joola.state.set('configuration', 'failure', 'Zookeeper session expired.');
  config.zookeeper.connect();
};

config.onauthenticationFailed = function () {

};

config.listChildren = function (path) {
  config.zookeeper.getChildren(
    path,
    function (event) {
      console.log('Got watcher event: %s', event);
      config.listChildren(path);
    },
    function (error, children, stat) {
      if (error) {
        console.log(
          'Failed to list children of %s due to: %s.',
          path,
          error
        );
        return;
      }

      console.log('Children of %s are: %j.', path, children);
    }
  );
};

config.onchange = function (event) {
  config.zookeeper.getData('/JOOLA', config.onchange, function (err, data, stat) {
    if (config.zversion !== stat.version) {
      config.localApply(JSON.parse(data).version, function (err) {
      });
    }
  });
};

config.clear = function (key, callback) {
  callback = callback || function () {
  };

  config.zookeeper.setData('/JOOLA', new Buffer(JSON.stringify(config._config)), function (err, stat) {
    config.zversion = stat.version;
    joola.dispatch.emit('config:change', key);
    if (callback && typeof callback === 'function')
      return callback(null);
  });
};

config.get = function (key, callback) {
  key = encodeURI(key).replace('.', '_$_');
  var result = joola.common.flatGetSet(config._config, key.replace(/:/ig, '.'));
  if (callback && typeof callback === 'function')
    return callback(null, result);
  return result;
};

config.set = function (key, value, callback) {
  callback = callback || function () {
  };

  key = encodeURI(key).replace('.', '_$_');

  joola.common.flatGetSet(config._config, key.replace(/:/ig, '.'), value);

  if (value === null) {
    return config.clear(key, callback);
  }
  config.zookeeper.setData('/JOOLA', new Buffer(JSON.stringify(config._config)), function (err, stat) {
    config.zversion = stat.version;
    joola.dispatch.emit('config:change', key);
    if (callback && typeof callback === 'function')
      return callback(null);
  });
};

config.storeVersion = function (callback) {
  config.zookeeper.getData('/JOOLA', config.onchange, function (err, config, stats) {
    if (err)
      return callback(err);
    config = JSON.parse(config);
    if (typeof config.version !== 'string')
      config.version = null;
    return callback(null, config.version);
  });
};

config.storeFlush = function (callback) {
  joola.logger.trace('Flushing configuration.');
  joola.zookeeper.setData('/JOOLA', new Buffer(), callback);
};

config.storePopulate = function (configuration, callback) {
  config.zookeeper.setData('/JOOLA', new Buffer(JSON.stringify(config._config)), function (err, stat) {
    if (err)
      return callback(err);
    config.zversion = stat.version;
    config.localApply(configuration.version, callback);
  });
};

config.localApply = function (storeVersion, key, callback) {
  if (typeof key === 'function') {
    callback = key;
    key = null;
  }

  var localVersion = config._config.version;
  joola.logger.debug('Applying central configuration to local store, version [' + storeVersion + '] -> [' + localVersion + '].');
  //let's get the central config and apply it on our object
  if (key)
    key = config.namespace + ':config:' + key + ':*';
  else
    key = config.namespace + ':config:*';

  config.zookeeper.getData('/JOOLA', config.onchange, function (err, data) {
    if (err)
      return callback(err);
    data = JSON.parse(data);
    Object.keys(data).forEach(function (key) {
      var value = data[key];
      joola.common.flatGetSet(config._config, key, value);
    });
    config.overrideWithEnvironment();
    return callback();
  });
};
