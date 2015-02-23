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
  async = require('async');

module.exports = ZKDiscoveryProvider;

function ZKDiscoveryProvider(options, helpers, callback) {
  if (!(this instanceof ZKDiscoveryProvider)) return new ZKDiscoveryProvider(options, helpers, callback);
  callback = callback || function () {
  };
  var self = this;

  this.name = 'Redis';

  this.options = options;
  this.UID = helpers.UID;
  this.config = helpers.config;
  this._config = helpers.baseconfig;
  this.logger = helpers.logger;
  this.common = helpers.common;
  this.state = helpers.state;
  this.dispatch = helpers.dispatch;
  this.localChange = false;
  
  this.initialized = false;
  this.zversion = 0;
  this.path = '/JOOLA/' + self.UID;
  var zkConfig = self.config.get('store:config:zookeeper');
  var zConnectionString = zkConfig.connectionstring;
  this.zookeeper = zookeeper.createClient(zConnectionString, {
    sessionTimeout: 5000,
    spinDelay: 1000,
    retries: 0
  });
  this.zookeeper.on('state', function (state) {
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

  self.onchange = function (event) {
    self.zookeeper.getData('/JOOLA', self.onchange, function (err, data, stat) {
      if (self.zversion !== stat.version) {
        self.localApply(JSON.parse(data).version, function (err) {
        });
      }
    });
  };
  
  self.logger.info('Connecting to Zookeeper...');
  self.zookeeper.connect();
}

ZKDiscoveryProvider.prototype.onconnected = function (callback) {
  var self = this;
  self.state.set('configuration', 'working', 'zookeeper connected.');
  self.zookeeper.create('/JOOLA', new Buffer(JSON.stringify(self._config)), zookeeper.ACL.OPEN_ACL_UNSAFE, zookeeper.CreateMode.PERSISTANT, function (err) {
    if (err) {
      //we already have a central node
      self.logger.info('Found a central configuration node.');
    }
    else {
      //we didn't have a central node
      self.logger.info('Created a central configuration node.');
    }

    self.zookeeper.create(self.path, new Buffer({}/*joola.nodeState()*/), zookeeper.ACL.OPEN_ACL_UNSAFE, zookeeper.CreateMode.EPHEMERAL, function (err) {
      if (err)
        return callback(err);
      self.logger.debug('Registered zookeeper node @ ' + self.path);
    });
  });
};

ZKDiscoveryProvider.prototype.ondisconnected = function () {
  var self = this;
  self.logger.warn('Disconnected from zookeeper, taking system offline.');
  self.state.set('configuration', 'failure', 'Zookeeper disconnected.');
};

ZKDiscoveryProvider.prototype.onexpired = function () {
  var self = this;
  self.logger.warn('Zookeeper session expired, taking system offline.');
  self.state.set('configuration', 'failure', 'Zookeeper session expired.');
  self.zookeeper.connect();
};

ZKDiscoveryProvider.prototype.onauthenticationFailed = function () {

};

ZKDiscoveryProvider.prototype.listChildren = function (path) {
  var self = this;
  self.zookeeper.getChildren(
    path,
    function (event) {
      console.log('Got watcher event: %s', event);
      self.listChildren(path);
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

ZKDiscoveryProvider.prototype.clear = function (key, callback) {
  var self = this;
  callback = callback || function () {
  };

  key = encodeURI(key).replace('.', '_$_');
  self.common.flatGetSet(self._config, key.replace(/:/ig, '.'), null);
  self.zookeeper.setData('/JOOLA', new Buffer(JSON.stringify(self._config)), function (err, stat) {
    self.zversion = stat.version;
    self.localChange = true;
    self.dispatch.emit('config:change', key);
    if (callback && typeof callback === 'function')
      return callback(null);
  });
};

ZKDiscoveryProvider.prototype.get = function (key, callback) {
  var self = this;
  key = encodeURI(key).replace('.', '_$_');
  var result = self.common.flatGetSet(self._config, key.replace(/:/ig, '.'));
  if (callback && typeof callback === 'function')
    return callback(null, result);
  return result;
};

ZKDiscoveryProvider.prototype.set = function (key, value, callback) {
  var self = this;
  callback = callback || function () {
  };

  key = encodeURI(key).replace('.', '_$_');
  self.common.flatGetSet(self._config, key.replace(/:/ig, '.'), value);
  if (value === null) {
    return self.clear(key, callback);
  }
  self.zookeeper.setData('/JOOLA', new Buffer(JSON.stringify(self._config)), function (err, stat) {
    self.zversion = stat.version;
    self.localChange = true;
    self.dispatch.emit('config:change', key);
    if (callback && typeof callback === 'function')
      return callback(null);
  });
};

ZKDiscoveryProvider.prototype.storeVersion = function (callback) {
  var self = this;
  self.zookeeper.getData('/JOOLA', self.onchange, function (err, config, stats) {
    if (err)
      return callback(err);
    config = JSON.parse(config);
    if (typeof config.version !== 'string')
      config.version = null;
    return callback(null, config.version);
  });
};

ZKDiscoveryProvider.prototype.storeFlush = function (callback) {
  var self = this;
  self.logger.trace('Flushing configuration.');
  self.zookeeper.setData('/JOOLA', new Buffer(), callback);
};

ZKDiscoveryProvider.prototype.storePopulate = function (configuration, callback) {
  var self = this;
  self.zookeeper.setData('/JOOLA', new Buffer(JSON.stringify(self._config)), function (err, stat) {
    if (err)
      return callback(err);
    self.zversion = stat.version;
    self.localApply(configuration.version, callback);
  });
};

ZKDiscoveryProvider.prototype.localApply = function (storeVersion, key, callback) {
  var self = this;
  if (typeof key === 'function') {
    callback = key;
    key = null;
  }
  if (self.localChange)
    return (self.localChange = false);  

  var localVersion = self._config.version;
  self.logger.debug('Applying central configuration to local store, version [' + storeVersion + '] -> [' + localVersion + '].');
  //let's get the central config and apply it on our object
  if (key)
    key = self.namespace + ':config:' + key + ':*';
  else
    key = self.namespace + ':config:*';

  self.zookeeper.getData('/JOOLA', self.onchange, function (err, data) {
    if (err)
      return callback(err);
    data = JSON.parse(data);
    Object.keys(data).forEach(function (key) {
      var value = data[key];
      self.common.flatGetSet(self._config, key, value);
    });
    self.config.overrideWithEnvironment();
    return callback();
  });
};