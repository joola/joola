'use strict';

/* Services */


var joolaServices = angular.module('ngjoola.services', ['ngjoola']);


joolaServices.service('dsService', function () {
  var self = this;
  this.getList = function (callback) {
    joolaio.dispatch.datasources.list(function (err, list) {
      if (err)
        return callback(err);
      //var tables = self.gettables('test');
      //list.datasources.tables = tables;
      return callback(err, list.datasources);
    });
  };
  this.delete = function (dsName) {
    var self = this;
    joolaio.dispatch.datasources.delete({name: dsName}, function () {
      self.getList(function (list) {
        return list;
      })
    });
  };
  this.add = function (ds, $scope) {
    var self = this;
    if (this.validateds(ds)) {
      joolaio.dispatch.datasources.add(ds, function () {
        self.getList(function (list) {
          $scope.$emit('listChange', list)
        })
      });
    }
  };

  this.validateds = function (ds) {
    return true;
  }

  this.gettables = function (ds) {

    var tables =
      [
        {
          "datasource": ds,
          "tables": [
            {
              "name": "table1",
              "columns": [
                {
                  "name": "column1",
                  "type": "string"
                },
                {
                  "name": "column2",
                  "type": "int"
                }
              ]
            },
            {
              "name": "table2",
              "columns": [
                {
                  "name": "column1",
                  "type": "string"
                },
                {
                  "name": "column2",
                  "type": "int"
                }
              ]
            }
          ]
        }
      ];
    return tables;
  }

});

joolaServices.service('dtService', function () {
  this.getList = function (callback) {
    joolaio.dispatch.datasources.list(function (err, list) {
      if (err)
        return callback(err);
      return callback(err, list.datasources);
    });
  };
  this.delete = function (dsName) {
    var self = this;
    joolaio.dispatch.datasources.delete({name: dsName}, function () {
      self.getList(function (list) {
        return list;
      })
    });
  };
  this.add = function (ds, $scope) {
    var self = this;
    joolaio.dispatch.datasources.add(ds, function () {
      self.getList(function (list) {
        $scope.$emit('listChange', list)
      })
    });
  };
});

joolaServices.service('userService', function () {
  this.getList = function (callback) {
    joolaio.users.list('joola', function (err, res) {
      console.log(err, res);
      if (err)
        callback(err);
      else
        callback(null, res);
    });
  };
  this.delete = function (user, callback) {
    var self = this;
    joolaio.dispatch.users.delete('joola', {username: user}, function () {
      return callback();
    });
  };
  this.add = function (user, callback) {
    var self = this;
    joolaio.dispatch.users.add('joola', user, function (err, res) {
      if (err)
        return callback(err);
      else
        return callback(null, res);
    });
  };

  this.update = function (user, callback) {
    var self = this;

    joolaio.dispatch.users.update('joola', user, function (err, res) {
      return callback(err, res);
    });
  };

  this.get = function (username, callback) {
    var self = this;
    joolaio.dispatch.users.get('joola', username, function (err, res) {
      if (err)
        return callback(err, null);
      else
        return callback(null, res);
    });
  };
  this.getRoles = function (callback) {
    var self = this;
    joolaio.dispatch.roles.list(function (err, res) {
      if (err)
        return callback(err);
      else
        return callback(null, res);
    })
  }

  this.getOrganizations = function (callback) {
    var self = this;
    joolaio.dispatch.organizations.list(function (err, res) {
      if (err)
        return callback(err);
      else
        return callback(null, res);
    })
  }

});


joolaServices.service('roleService', function () {
  this.getList = function (callback) {
    joolaio.dispatch.roles.list(function (err, res) {
      if (err)
        callback(err);
      else
        callback(null, res);
    });
  };
  this.delete = function (role, callback) {
    var self = this;
    joolaio.dispatch.roles.delete({name: role}, function () {
      return callback();
    });
  };
  this.add = function (role, callback) {
    var self = this;
    joolaio.dispatch.roles.add(role, function (err, res) {
      if (err)
        return callback(err);
      else
        return callback(null, res);
    });
  };

  this.update = function (role, callback) {
    var self = this;

    joolaio.dispatch.roles.update(role, function (err, res) {
      return callback(err, res);
    });
  };

  this.get = function (role, callback) {
    var self = this;
    joolaio.dispatch.roles.get(role, function (err, res) {
      if (err)
        return callback(err, null);
      else
        return callback(null, res);
    });
  };

  this.listPermissions = function (callback) {
    var self = this;
    joolaio.dispatch.permissions.list(function (err, res) {
      if (err)
        return callback(err, null);
      else
        return callback(null, res);
    });
  };
});


joolaServices.service('orgService', function () {
  this.getList = function (callback) {
    joolaio.dispatch.organizations.list(function (err, res) {
      if (err)
        callback(err);
      else
        callback(null, res);
    });
  };
  this.delete = function (org, callback) {
    var self = this;
    joolaio.dispatch.organizations.delete({name: org}, function () {
      return callback();
    });
  };
  this.add = function (org, callback) {
    var self = this;
    joolaio.dispatch.organizations.add(org, function (err, res) {
      if (err)
        return callback(err);
      else
        return callback(null, res);
    });
  };

  this.update = function (org, callback) {
    var self = this;

    joolaio.dispatch.organizations.update(org, function (err, res) {
      return callback(err, res);
    });
  };

  this.get = function (org, callback) {
    var self = this;
    joolaio.dispatch.organizations.get(org, function (err, res) {
      if (err)
        return callback(err, null);
      else
        return callback(null, res);
    });
  };
});


joolaServices.service('logService', function () {
  this.fetch = function (callback) {

    joolaio.dispatch.logger.fetch(function (err, res) {
      /*
       socket.on('logger/fetch:done', function (err,log) {
       callback(log.logger);
       })
       */
      callback(err, res);
    });
  }
});

joolaServices.service('settingsService', function () {
  this.purgeCache = function (callback) {
    console.log('Purging cache..');
    return callback();
  };

  this.takeOffline = function (callback) {
    console.log('Taking system offline..');
    return callback();
  }

  this.updateInterfaces = function (interfaces, callback) {
    joolaio.dispatch.config.set('interfaces', interfaces, function (err, res) {
      if (err)
        return callback(err);
      else
        return callback(null, res);
    });
  }

  this.updateStore = function (store, callback) {
    joolaio.dispatch.config.set('store', store, function (err, res) {
      if (err)
        return callback(err);
      else
        return callback(null, res);
    });
  }

  this.updateGeneral = function (general, callback) {
    joolaio.dispatch.config.set('general', general, function (err, res) {
      if (err)
        return callback(err);
      else
        return callback(null, res);
    });
  }

  this.getSettings = function (callback) {
    var result = {};
    joolaio.dispatch.config.get('interfaces', function (err, interfaces) {
      if (err)
        return callback(err);
      else {
        result.interfaces = interfaces;
        joolaio.dispatch.config.get('store', function (err, store) {
          if (err)
            return callback(err);
          else {
            result.store = store;
            joolaio.dispatch.config.get('general', function (err, general) {
              if (err)
                return callback(err);
              else {
                result.general = general;
                return callback(null, result);
              }
            });

          }

        });
      }
    });
  }
});
  
  
  