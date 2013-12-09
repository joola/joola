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
    $scope.$apply(function () {
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

joolaControllers.controller('logCtrl', function ($scope, logService) {
  logService.fetch(function (err, log) {
    $scope.$apply(function () {
      $scope.log = log;
      $scope.staticlog = log;
    });
  });

  $scope.eventDateFilter = function (column) {
    console.log('filtering date by ', column);
    if (column === 'day') {
      $scope.log = [];
      angular.forEach($scope.staticlog, function (value, key) {
        var d = new Date(value.time);
        var today = new Date();
        if (d.setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0)) {
          $scope.log.push(value);
        }
      });
    }
    if (column === '1hour') {
      $scope.log = [];
      angular.forEach($scope.staticlog, function (value, key) {
        var d = new Date(value.time);
        var hour = new Date() - 3600000;
        if (d > hour) {
          $scope.log.push(value);
        }
      });
      
    }
    if (column === '5min') {
      $scope.log = [];
      angular.forEach($scope.staticlog, function (value, key) {
        var d = new Date(value.time);
        var min5 = new Date() - 300000;
        if (d > min5) {
          $scope.log.push(value);
        }
      });
    }
    if (column === '1min') {
      $scope.log = [];
      angular.forEach($scope.staticlog, function (value, key) {
        var d = new Date(value.time);
        var min1 = new Date() - 300000;
        if (d > min1) {
          $scope.log.push(value);
        }
      });
    } else {
      $scope.log = $scope.staticlog;
    }
  }
});


