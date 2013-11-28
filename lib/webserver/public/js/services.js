'use strict';

/* Services */


var joolaServices = angular.module('ngjoola.services', ['ngjoola']);
// Demonstrate how to register services
// In this case it is a simple value service.
joolaServices.service('dsService', function (socket) {
  this.getList = function (callback) {
    joolaio.objects.datasources.list(function () {
      socket.on('datasources/list:done', function (list) {
        callback(list.datasources);
      })
    });
  };
  this.delete = function (dsName) {
    joolaio.objects.datasources.delete({name: dsName}, function () {
      socket.on('datasources/delete:done', function (list) {
        joolaio.objects.datasources.list()
      })
    });
  };
  this.add = function (ds, $scope) {

    joolaio.objects.datasources.add(ds);
    getList(function(list) {
      console.log('aa', list);
    })
    /*
     joolaio.objects.datasources.add(ds, function() {
     socket.on('datasources/add:done', function(res) {
     console.log('add done');
     joolaio.objects.datasources.list();
     $scope.$emit('listChange', res);
     })
     });
     */
  };
});

