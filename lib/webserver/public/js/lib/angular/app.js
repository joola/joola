'use strict';

// Declare app level module which depends on filters, and services



var ngjoola = angular.module('ngjoola', [
  'ngRoute',
  'ngjoola.controllers',
  'ngjoola.filters',
  'ngjoola.services',
  'ngjoola.directives'
])


ngjoola.factory('socket', function ($rootScope) {
  joolaio.events.on('core.init.browser-finish', function () {
    var socket = joolaio.io.socket;
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            joolaio.events.emit('angular.init.finish');
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              joolaio.events.emit('angular.init.finish');
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  });
});