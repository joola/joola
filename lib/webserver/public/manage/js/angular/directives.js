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
    template: '<li ng-repeat="m in menu" ng-class="{\'dropdown\':m.submenu}">' +
      '<a href="{{m.url}}" ng-class="{\'dropdown-toggle\':m.submenu}" ng-attr-data-toggle="{{m.type}}">' +
      '<i class="{{m.image}}"></i>' +
      ' {{m.name}}' +
      '<b class="caret" ng-if="m.submenu"></b>' +
      '</a>' +
      '<ul ng-if="m.submenu" class="dropdown-menu">' +
      '<li ng-repeat="s in m.submenu"><a href="{{s.url}}"><i class="{{s.image}}"></i> {{s.name}}</a></li>' +
      '</ul>' +
      '</li>',
      
    link: function (scope, elem, attrs) {
      scope.menu = [
        {
          "name": "Dashboard",
          "url": "/manage/index",
          "image": "fa fa-bar-chart-o"
        },
        {
          "name": "Data Integration",
          "url": "/manage/dataintegration/index",
          "image": "fa fa-dashboard"
        },
        {
          "name": "Users",
          "url": "/manage/users/index",
          "image": "fa fa-dashboard"
        },
        {
          "name": "Logger",
          "url": "/manage/logger/index",
          "image": "fa fa-dashboard"
        },
        {
          "name": "Drop",
          "url": "",
          "type": "dropdown",
          "image": "fa fa-dashboard",
          "submenu": [
            {
              "name": "Logger",
              "url": "/manage/logger/index",
              "image": "fa fa-dashboard"
            },
            {
              "name": "Logger2",
              "url": "/manage/logger/index",
              "image": "fa fa-dashboard"
            }
          ]
        }
      ]

    }
  }
});
/*
 joolaDirective.directive('sidebar', function () {
 return {
 restrict: 'E',
 replace: true,
 template: '<li ng-repeat="l in logs"></li>'

 }
 });
 */