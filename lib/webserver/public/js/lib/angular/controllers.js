'use strict';

/* Controllers */

var joolaControllers = angular.module('ngjoola.controllers', ['ngjoola']);

joolaControllers.controller('AppCtrl', function ($scope, $http) {
  $http({
    method: 'GET',
    url: '/api/name'
  }).
    success(function (data, status, headers, config) {
      $scope.name = data.name;
    }).
    error(function (data, status, headers, config) {
      $scope.name = 'Error!'
    });
});

joolaControllers.controller('dsCtrl', function ($scope, dsService) {
  
  dsService.getList(function (err, list) {
    $scope.$apply(function() {
      var arr = [];
      Object.keys(list).forEach(function (key) {
        arr.push(list[key]);
      });
      $scope.list = arr;
    })      
  });
  $scope.dsDelete = function (dsName) {
    dsService.delete(dsName);
  }
  $scope.dsAdd = function () {
    dsService.add({name: $scope.name, type: $scope.dbtype, _connectionString: $scope.connectionString}, $scope);
    $('#datasourceAdd').modal('hide');
  }
});

joolaControllers.controller('userCtrl', function ($scope, userService) {
  userService.getList(function (list) {
    $scope.list = list;
  });
  $scope.userDelete = function (dsName) {
    userService.delete(dsName);
  }
  $scope.userAdd = function () {
    userService.add({_username: $scope._username, _email: $scope._email, _password: $scope._password, _roles: $scope._roles, _filter: $scope._filter, displayName: $scope.displayName}, $scope);
  }
});

