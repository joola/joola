'use strict';

// Declare app level module which depends on filters, and services

var ngjoola = angular.module('ngjoola', [
  'ngRoute',
  'ngjoola.controllers',
  'ngjoola.filters',
  'ngjoola.services',
  'ngjoola.directives'
])
ngjoola.config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/view1', {
      templateUrl: 'partials/partial1',
      controller: 'MyCtrl1'
    }).
    when('/view2', {
      templateUrl: 'partials/partial2',
      controller: 'MyCtrl2'
    }).
    when('/', {
      //templateUrl: 'partials/partial2',
      controller: 'homepageCtrl'
    }).
    otherwise({
      redirectTo: '/view1'
    });

  $locationProvider.html5Mode(true);
});

ngjoola.factory('socket', function ($rootScope) {
  var socket = joolaio.io.socket;
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
