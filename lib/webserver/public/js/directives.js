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
    template: '<li ng-repeat="(keymenu, valmenu) in menu"><a href="{{valmenu.url}}"><i class="{{valmenu.image}}"></i><span class="hidden-sm">{{keymenu}}</span></a></li>',
    link: function (scope, elem, attrs) {
      scope.menu = {
        "Home": {
          "sort": 1,
          "url": "/",
          "image": "fa fa-bar-chart-o"
        },
        "Datasources": {
          "sort": 2,
          "url": "/datasources",
          "image": "fa fa-dashboard"
        }
      }
    }
  }
});

joolaDirective.directive('sidebar', function () {
  return {
    restrict: 'E',
    replace: true,
    template: '<li ng-repeat="(keymenu, valmenu) in menu"><a href="{{valmenu.url}}"><i class="{{valmenu.image}}"></i><span class="hidden-sm">{{keymenu}}</span></a></li>',
    link: function (scope, elem, attrs, socket) {
      scope.menu = {
        "Home": {
          "sort": 1,
          "url": "/",
          "image": "fa fa-bar-chart-o"
        },
        "Datasources": {
          "sort": 2,
          "url": "/datasources",
          "image": "fa fa-dashboard"
        }
      }
    }
  }
});