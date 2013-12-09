'use strict';

/* Services */


var joolaServices = angular.module('ngjoola.services', ['ngjoola']);

joolaServices.service('dsService', function (socket) {
  this.getList = function (callback) {
    joolaio.dispatch.datasources.list(function (err, list) {
      if (err)
        return callback(err);

      return callback(null, list.datasources);
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
    joolaio.dispatch.users.list(function () {
      socket.on('users/list:done', function (list) {
        callback(list.users);
      })
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
  this.add = function (user, $scope) {
    var self = this;
    joolaio.dispatch.users.add(user, function () {
      self.getList(function (list) {
        $scope.$emit('userChange', list)
      })
    });
  };
});

joolaServices.service('logService', function (socket) {
  this.fetch = function (callback) {
    joolaio.dispatch.logger.fetch(function(err,res) {
      /*
      socket.on('logger/fetch:done', function (err,log) {
        callback(log.logger);
      })
      */
      callback(err, res);
    });
  }
});
