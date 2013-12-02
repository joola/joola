'use strict';

var joolaDirective = angular.module('ngjoola.directives', ['ngjoola']);

joolaDirective.directive('appVersion', function (version) {
  return function (scope, elm, attrs) {
    elm.text(version);
  };
});

joolaDirective.directive('sidebar', function () {
  return {
    restrict: 'E',
    replace: true,
    template: '<li ng-repeat="m in menu"><a href="{{m.url}}"><i class="{{m.image}}"></i><span class="hidden-sm">{{m.name}}</span></a></li>',
    link: function (scope, elem, attrs) {
      scope.menu = [
        {
          "name": "Home",
          "url": "/",
          "image": "fa fa-bar-chart-o"
        },
        {
          "name": "Datasources",
          "url": "/datasources/index",
          "image": "fa fa-dashboard"
        },
        {
          "name": "Users",
          "url": "/users/index",
          "image": "fa fa-dashboard"
        },
        {
          "name": "Logger",
          "url": "/Logger",
          "image": "fa fa-dashboard"
        }
      ]

    }
  }
});
