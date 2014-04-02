'use strict';

/* Filters */

angular.module('ngjoola.filters', []).
  filter('interpolate', function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  });
/*
angular.module('ngjoola.filters', [])
  .filter('arrayToList', function() {
    return function(input) {
      // do some bounds checking here to ensure it has that index
      console.log('zxc',input);
      return input
    }
  });
*/