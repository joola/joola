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


joolaServices.service('userService', function (socket) {
  this.getList = function (callback) {
    joolaio.dispatch.users.list(function (err, res) {
      if (err)
        callback(err);
      else
        callback(null, res);
    });
  };
  this.delete = function (uid) {
    var self = this;
    joolaio.dispatch.users.delete({name: username}, function () {
      self.getList(function (list) {
        return list;
      })
    });
  };
  this.add = function (user, callback) {
    var self = this;
    joolaio.dispatch.users.add(user, function (err,res) {
      if (err)
        return callback(err);
      else
        return callback(null, res);
    });
  };

  this.update = function (user, callback) {
    var self = this;

    joolaio.dispatch.users.update(user, function (err, res) {
      return callback(err, res);
    });
  };

  this.get = function (username, callback) {
    var self = this;
    joolaio.dispatch.users.get(username, function (err, res) {
      if (err)
        return callback(err, null);
      else
        return callback(null, res);
    });
  };
  this.getRoles = function(callback) {
    var self = this;
    joolaio.dispatch.roles.list(function(err,res) {
      if (err)
        return callback(err);
      else
        return callback(null,res);
    })
  }
});

joolaServices.service('logService', function (socket) {
  console.log('asdasd');
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

