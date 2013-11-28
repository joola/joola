'use strict';

/* Services */


var joolaServices = angular.module('ngjoola.services', ['ngjoola']);

joolaServices.service('dsService', function (socket) {
  this.getList = function (callback) {
    joolaio.objects.datasources.list(function () {
      socket.on('datasources/list:done', function (list) {
        callback(list.datasources);
      })
    });
  };
  this.delete = function (dsName) {
    var self = this;
    joolaio.objects.datasources.delete({name: dsName}, function () {
      self.getList(function(list) {
        return list;
      })
    });
  };
  this.add = function (ds, $scope) {
    var self = this;
    joolaio.objects.datasources.add(ds, function() {
      self.getList(function(list) {
        $scope.$emit('listChange', list)
      })  
    });
  };
});

