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
  dsService.getList(function (list) {
    $scope.list = list;
  });
  $scope.dsDelete = function (dsName) {
    dsService.delete(dsName);
  }
  $scope.dsAdd = function () {
    dsService.add({name: $scope.name, type: $scope.dbtype, _connectionString: $scope.connectionString}, $scope);
  }
});