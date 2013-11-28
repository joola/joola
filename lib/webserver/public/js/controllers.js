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

joolaControllers.controller('homepageCtrl', function ($scope) {
  $scope.name = 'test';

})

joolaControllers.controller('MyCtrl2', function ($scope) {
  // write Ctrl here

});

joolaControllers.controller('dsCtrl', function($scope, dsService) {
  $scope.list = dsService.getList();
  $scope.add = dsService.add();
  $scope.delete = dsService.delete();
});

/*
function dslist($scope, socket) {
  $scope.remove = function (datasource) {
    joolaio.objects.datasources.delete({name: datasource.name}, function () {
      joolaio.io.socket.emit('datasources/list');
    });
  }
  socket.on('datasources/list:done', function (datasources) {
    $scope.datasources = datasources.datasources;
  });
}
*/