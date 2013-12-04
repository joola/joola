'use strict';

/* Services */


var joolaServices = angular.module('ngjoola.services', ['ngjoola']);

joolaServices.service('dsService', function (socket) {
  this.getList = function (callback) {
    joolaio.objects.datasources.list(function (err, list) {
      if (err)
        return callback(err);

      return callback(null, list.datasources);
    });
  };
  this.delete = function (dsName) {
    var self = this;
    joolaio.objects.datasources.delete({name: dsName}, function () {
      self.getList(function (list) {
        return list;
      })
    });
  };
  this.add = function (ds, $scope) {
    var self = this;
    joolaio.objects.datasources.add(ds, function () {
      self.getList(function (list) {
        $scope.$emit('listChange', list)
      })
    });
  };
});


joolaServices.service('userService', function (socket) {
  this.getList = function (callback) {
    joolaio.objects.users.list(function () {
      socket.on('users/list:done', function (list) {
        callback(list.users);
      })
    });
  };
  this.delete = function (uid) {
    var self = this;
    joolaio.objects.users.delete({name: username}, function () {
      self.getList(function (list) {
        return list;
      })
    });
  };
  this.add = function (user, $scope) {
    var self = this;
    joolaio.objects.users.add(user, function () {
      self.getList(function (list) {
        $scope.$emit('userChange', list)
      })
    });
  };
});
