'use strict';

/* Services */


var joolaServices = angular.module('ngjoola.services', ['ngjoola']);


// Demonstrate how to register services
// In this case it is a simple value service.
joolaServices.service('dsService', function () {
  this.getList = function () {
    console.log('getting datasource list');
    //This will return a list of datasources
    return [{"name": "test", "type": "test123"}, {"name":"test2","type":"mysql"}]
  };
  this.delete = function () {
    //This will delete a datasource
  };
  this.add = function () {
    console.log('adding a datasource');
    //this.getList();
    //This will add a data source
  };
});

