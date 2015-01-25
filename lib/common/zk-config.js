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
  zookeeper = require('node-zookeeper-client'),
  semver = require('semver'),
  util = require('util'),
  events = require('events'),
  common = require('./index');

var Config = module.exports = function (options, callback) {
  var self = this;
  events.EventEmitter.call(this);

  //base config object, following the require config has been parsed and available for the local node. May differ from central.
  self._config = options._config || {version: '0.0.0'};
  self.nodeState = options.nodeState || {};
  self.zversion = 0;
  self.root = '/JOOLA';
  self.path = options.path || (self.root + '/' + common.uuid());
  var zConnectionString = options.connectionString || 'localhost:2181';
  self.zookeeper = zookeeper.createClient(zConnectionString, {
    sessionTimeout: 5000,
    spinDelay: 1000,
    retries: 0
  });
  self.initialized = false;
  self.zookeeper.on('state', function (state) {
    switch (state) {
      case zookeeper.State.SYNC_CONNECTED:
        if (!self.initialized) {
          self.initialized = true;
          self.onconnected(callback);
        }
        else
          self.onconnected(function () {
          });
        break;
      case zookeeper.State.DISCONNECTED:
        self.ondisconnected();
        break;
      case zookeeper.State.EXPIRED:
        self.onexpired();
        break;
      default:
        break;
    }
  });
  self.emit('log', {level: 'info', message: 'Connecting to Zookeeper...'});
  self.zookeeper.connect();

  self.close = function (callback) {
    if (!callback)
      callback = function () {

      };

    self.zookeeper.close();
    return callback(null);
  };

  self.onconnected = function (callback) {
    self.emit('state', 'connected');
    self.zookeeper.create(self.root, new Buffer(JSON.stringify(self._config)), zookeeper.ACL.OPEN_ACL_UNSAFE, zookeeper.CreateMode.PERSISTANT, function (err) {
      if (err) {
        //we already have a central node
        self.emit('log', {level: 'info', message: 'Found a central configuration node: ' + err});
      }
      else {
        //we didn't have a central node
        self.emit('log', {level: 'info', message: 'Created a central configuration node.'});
      }

      self.zookeeper.create(self.path, new Buffer(self.nodeState), zookeeper.ACL.OPEN_ACL_UNSAFE, zookeeper.CreateMode.EPHEMERAL, function (err) {
        if (err)
          return callback(err);
        self.emit('log', {level: 'debug', message: 'Registered zookeeper node @ ' + self.path});
      });


      //first of all wipe any left behind configuration.
      common.extend(exports, self._config);
      self.storeVersion(function (err, storeVersion) {
        if (err)
          return callback(err);

        var fileVersion = self.get('version') || '0.0.0';
        if (storeVersion) {
          //we have an existing config
          if (semver.gt(fileVersion, storeVersion)) {
            //we need to replace the existing version
            self.emit('log', {level: 'warn', message: 'Found an out-dated central configuration store with version [' + storeVersion + '], updating to version [' + fileVersion + '].'});

            self.storePopulate(self._config, function (err) {
              if (err)
                return callback(err);
              //store is now populated with local copy
              self.emit('ready');
              return callback(null, self);
            });
          }
          else if (semver.eq(fileVersion, storeVersion)) {
            self.emit('log', {level: 'info', message: 'Found a valid configuration store with version [' + fileVersion + '].'});
            self.localApply(fileVersion, function (err) {
              if (err)
                return callback(err);

              self.emit('ready');
              return callback(null, self);
            });
          }
          else {
            self.emit('log', {level: 'info', message: 'Found an out-dated local configuration with version [' + fileVersion + '].'});
            //we need to override local configuration with central
            self.localApply(storeVersion, function (err) {
              if (err)
                return callback(err);

              self.emit('ready');
              return callback(null, self);
            });
          }
        }
        else {
          //we have an empty store, let's populate it
          self.emit('log', {level: 'info', message: 'Found an empty store, populating with version [' + fileVersion + '].'});
          //self.overrideWithEnvironment();
          self.storePopulate(self._config, function (err) {
            if (err)
              return callback(err);
            //store is now populated with local copy
            self.emit('ready');
            return callback(null, self);
          });
        }
      });
    });
  };

  self.ondisconnected = function () {
    self.emit('log', {level: 'info', message: 'Disconnected from zookeeper, taking system offline.'});
    self.emit('state', 'disconnected');
  };

  self.onexpired = function () {
    self.emit('log', {level: 'info', message: 'Zookeeper session expired, taking system offline.'});
    self.emit('state', 'expired');
    self.zookeeper.connect();
  };

  self.onauthenticationFailed = function () {

  };

  self.onchange = function (event) {
    self.zookeeper.getData(self.root, self.onchange, function (err, data, stat) {
      if (self.zversion !== stat.version) {
        self.emit('change', event);
        self.localApply(JSON.parse(data).version, function (err) {
        });
      }
    });
  };

  self.clear = function (key, callback) {
    callback = callback || function () {
    };

    key = encodeURI(key).replace('.', '_$_');
    common.flatGetSet(self._config, key.replace(/:/ig, '.'), null);
    self.zookeeper.setData(self.root, new Buffer(JSON.stringify(self._config)), function (err, stat) {
      self.zversion = stat.version;
      self.emit('change', {key: key, value: null});
      if (callback && typeof callback === 'function')
        return callback(null);
    });
  };

  self.get = function (key, callback) {
    key = encodeURI(key).replace('.', '_$_');
    var result = common.flatGetSet(self._config, key.replace(/:/ig, '.'));
    if (callback && typeof callback === 'function')
      return callback(null, result);
    return result;
  };

  self.set = function (key, value, callback) {
    callback = callback || function () {
    };

    key = encodeURI(key).replace('.', '_$_');
    common.flatGetSet(self._config, key.replace(/:/ig, '.'), value);
    if (value === null) {
      return self.clear(key, callback);
    }
    self.zookeeper.setData(self.root, new Buffer(JSON.stringify(self._config)), function (err, stat) {
      self.zversion = stat.version;
      self.emit('change', {key: key, value: value});
      if (callback && typeof callback === 'function')
        return callback(null);
    });
  };

  self.storeVersion = function (callback) {
    self.zookeeper.getData(self.root, self.onchange, function (err, config, stats) {
      if (err)
        return callback(err);
      config = JSON.parse(config);
      if (typeof config.version !== 'string')
        config.version = null;
      return callback(null, config.version);
    });
  };

  self.storeFlush = function (callback) {
    self.emit('log', {level: 'info', message: 'Flushing configuration.'});
    joola.zookeeper.setData(self.root, new Buffer(), callback);
  };

  self.storePopulate = function (configuration, callback) {
    self.zookeeper.setData(self.root, new Buffer(JSON.stringify(self._config)), function (err, stat) {
      if (err)
        return callback(err);
      self.zversion = stat.version;
      self.localApply(configuration.version, callback);
    });
  };

  self.localApply = function (storeVersion, key, callback) {
    if (typeof key === 'function') {
      callback = key;
      key = null;
    }

    var localVersion = self._config.version;
    self.emit('log', {level: 'info', message: 'Applying central configuration to local store, version [' + storeVersion + '] -> [' + localVersion + '].'});
    //let's get the central config and apply it on our object
    if (key)
      key = self.namespace + ':config:' + key + ':*';
    else
      key = self.namespace + ':config:*';

    self.zookeeper.getData(self.root, self.onchange, function (err, data) {
      if (err)
        return callback(err);
      data = JSON.parse(data);
      Object.keys(data).forEach(function (key) {
        var value = data[key];
        common.flatGetSet(self._config, key, value);
      });
      //self.overrideWithEnvironment();
      return callback();
    });
  };
};
util.inherits(Config, events.EventEmitter);