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
      $scope.datasources = arr;

    })
  });

  $scope.dsDelete = function (dsName) {
    dsService.delete(dsName);
  };

  $scope.dsAdd = function () {
    dsService.add({name: $scope.name, type: $scope.dbtype, dbhost: $scope.dbhost, dbport: $scope.dbport, dbname: $scope.dbname, dbuser: $scope.dbuser, dbpass: $scope.dbpass}, $scope);
    $('#datasourceAdd').modal('hide');
  }
});

joolaControllers.controller('dtCtrl', function ($scope, dtService) {
  dtService.getList(function (err, list) {
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
    dsService.add({name: $scope.name, type: $scope.dbtype, dbhost: $scope.dbhost, dbport: $scope.dbport, dbname: $scope.dbname, dbuser: $scope.dbuser, dbpass: $scope.dbpass}, $scope);
    $('#datasourceAdd').modal('hide');
  }
});


joolaControllers.controller('userCtrl', function ($scope, userService) {

  $scope.arrayToList = function (input) {

    var li = '<ul>';
    input.forEach(function (val) {
      li += "<li>" + val + "</li>";
    });
    li += "</ul>"
    return li;
  }

  userService.getList(function (err, list) {
    if (err)
      console.log('Error: ', err);
    else
      $scope.$apply(function () {
        $scope.list = list;
      });
  });
  $scope.userDelete = function (dsName) {
    userService.delete(dsName);
  }

  $scope.userEdit = function (username) {
    clearNgDialog('editUserDialog');
    userService.get(username, function (err, res) {
      userService.getRoles(function (err, roles) {
        userService.getOrganizations(function (err, orgs) {
          if ($.isArray(res._roles)) {
            res._roles.forEach(function (d) {
              if (roles[d]) {
                roles[d].checked = 'checked';
              }
            })
          }


          if (res.organization)
            orgs[res.organization].checked = 'checked';


          $('#editUserDialog .modal-title').text('Edit - ' + username);
          $scope.$apply(function () {
            $scope.editUsername = res.username;
            $scope.editDisplayName = res.displayName;
            $scope.editRoles = roles;
            $scope.editOrgs = orgs;
            $scope.editPermissions = res._filter;
            $scope.editOrganization = res.organization;
            $scope.editStore = res.store;

          });
          $('#editUserDialog').modal('show');
        })
      })
    })
  }
  $scope.updateUser = function (user) {

    $('#editUserDialog button').attr("disabled", "disabled");
    $('#editUserDialog .spinner').css('display', 'inline-block');
    $('#editUserDialog #username').removeAttr('disabled');
    var user = $('#editUserForm').serializeObject();
    console.log('user',user);
    if (!$.isArray(user._roles) && user._roles != null)
      user._roles = new Array(user._roles);

    if (user._roles == null)
      user._roles = '';

    $('#editUserDialog #username').attr('disabled', 'disabled');
    userService.update(user, function (err, res) {
      $('#editUserDialog').modal('hide');

      userService.getList(function (err, list) {
        if (err)
          console.log('Error: ', err);
        else
          $scope.$apply(function () {
            $scope.list = list;
          });
      });

    });
  }

  $scope.addUser = function (user) {
    $('#addUserDialog .spinner').css('display', 'inline-block');
    var user = $('#addUserForm').serializeObject();
    if (!$.isArray(user._roles))
      user._roles = new Array(user._roles);
    userService.add(user, function (err, res) {
      $('#addUserDialog').modal('hide');
      userService.getList(function (err, list) {
        if (err)
          console.log('Error: ', err);
        else
          $scope.$apply(function () {
            $scope.list = list;
          });
      });
    });

  }

  $scope.prepareAddUser = function () {
    userService.getRoles(function (err, roles) {
      $scope.$apply(function () {
        $scope.roleList = roles;
      })
    });

    userService.getOrganizations(function (err, orgs) {
      $scope.$apply(function () {
        $scope.orgList = orgs;
      })
    });
  }
});

joolaControllers.controller('logCtrl', function ($scope, logService) {
  logService.fetch(function (err, log) {
    //$('#logtbody').append('<tr><td>Loading logs...</td></tr>');
    $scope.$apply(function () {
      $scope.log = log;
      $scope.staticlog = log;
    });
  });

  $scope.eventDateFilter = function (column) {
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


