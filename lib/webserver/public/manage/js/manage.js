var baseUrl = require.toUrl('./');

var frameworkBin = [
  baseUrl + 'angular/app.js',
  baseUrl + 'angular/services.js',
  baseUrl + 'angular/controllers.js',
  baseUrl + 'angular/directives.js',
  baseUrl + 'angular/filters.js'
];

var manageBin = [
  baseUrl + 'dashboard.js'
];

//The magic starts only after the document is loaded and joola.io framework is loaded.
$(document).ready(function () {
  define(["require"], function (require) {
    require(frameworkBin, function () {
      angular.bootstrap(document, ['ngjoola']);
      require(manageBin, function () {

      });
    });
  });
});