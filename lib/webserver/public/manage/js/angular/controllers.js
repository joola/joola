'use strict';

/* Controllers */


var joolaControllers = angular.module('ngjoola.controllers', ['ngjoola']);

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

  $scope.userEdit = function (username) {
    clearNgDialog('editUserDialog');
    userService.get(username, function (err, res) {
      console.log(res);
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
            $scope.editFilters = res._filter;
            $scope.editOrganization = res.organization;
            $scope.editStore = res.store;

          });
          $('#editUserDialog').modal('show');
        })
      })
    })
  }
  $scope.updateUser = function (user) {
    var validate = [
      {"id": "displayname", "minlength": 3, "type": "text"},
      {"id": "_roles", "minlength": 1, "type": "checkbox"},
      {"id": "filters", "minlength": 0, "type": "text"},
      {"id": "organization", "minlength": 1, "type": "radio"}
    ];
    if (validateForm('editUserForm', validate)) {
      $('#editUserDialog button').attr("disabled", "disabled");
      $('#editUserDialog .spinner').css('display', 'inline-block');
      $('#editUserDialog #username').removeAttr('disabled');
      var user = $('#editUserForm').serializeObject();
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
  }

  $scope.addUser = function (user) {
    var validate = [
      {"id": "add_username", "minlength": 3, "type": "text"},
      {"id": "add_password", "minlength": 4, "type": "text"},
      {"id": "add_displayname", "minlength": 3, "type": "text"},
      {"id": "_roles", "minlength": 1, "type": "checkbox"},
      {"id": "add_filters", "minlength": 0, "type": "text"},
      {"id": "organization", "minlength": 1, "type": "radio"}
    ];
    if (validateForm('addUserForm', validate)) {
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


  }

  $scope.userDel = function (user) {
    userService.delete(user, function () {
      $('#warning').modal('hide');
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
      userService.getOrganizations(function (err, orgs) {
        $scope.$apply(function () {
          $scope.roleList = roles;
          $scope.orgList = orgs;
        })
      });
    });
  }

  $scope.dryDel = function (user) {
    $('#warning').modal();
    $scope.deluserval = user;
  }

});


joolaControllers.controller('roleCtrl', function ($scope, roleService) {
  $scope.arrayToList = function (input) {

    var li = '<ul>';
    input.forEach(function (val) {
      li += "<li>" + val + "</li>";
    });
    li += "</ul>"
    return li;
  }

  roleService.getList(function (err, list) {
    if (err)
      console.log('Error: ', err);
    else
      $scope.$apply(function () {
        $scope.list = list;
      });
  });

  $scope.roleEdit = function (role) {

    clearNgDialog('editRoleDialog');
    roleService.get(role, function (err, res) {
      roleService.listPermissions(function (err, perms) {
        var permsCheckbox = {};
        perms.forEach(function (d, i) {
          permsCheckbox[d] = {};
          if (res.permissions.indexOf(d) > -1) {
            permsCheckbox[d].checked = "checked";
          }
        })

        $('#editUserDialog .modal-title').text('Edit - ' + role);
        $scope.$apply(function () {
          $scope.editRolename = res.name;
          $scope.editFilters = res._filter;
          $scope.editPermissions = permsCheckbox;
        });
        $('#editRoleDialog').modal('show');
      });
    });

  }
  $scope.updateRole = function () {
    var validate = [
      {"id": "permissions", "minlength": 1, "type": "checkbox"},
      {"id": "filter", "minlength": 0, "type": "text"}
    ];
    if (validateForm('editRoleForm', validate)) {
      $('#editRoleDialog button').attr("disabled", "disabled");
      $('#editRoleDialog .spinner').css('display', 'inline-block');
      $('#editRoleDialog #rolename').removeAttr('disabled');
      var role = $('#editRoleForm').serializeObject();
      if (!$.isArray(role.permissions) && role.permissions != null)
        role.permissions = new Array(role.permissions);

      if (role.permissions == null)
        role.permissions = '';

      $('#editRoleDialog #rolename').attr('disabled', 'disabled');
      roleService.update(role, function (err, res) {
        $('#editRoleDialog').modal('hide');

        roleService.getList(function (err, list) {
          if (err)
            console.log('Error: ', err);
          else
            $scope.$apply(function () {
              $scope.list = list;
            });
        });

      });
    }
  }

  $scope.addRole = function (user) {
    var validate = [
      {"id": "add_rolename", "minlength": 1, "type": "text"},
      {"id": "permissions", "minlength": 1, "type": "checkbox"},
      {"id": "filter", "minlength": 0, "type": "text"}
    ];
    if (validateForm('addRoleForm', validate)) {
      $('#addRoleDialog .spinner').css('display', 'inline-block');
      var role = $('#addRoleForm').serializeObject();
      if (!$.isArray(role.permissions))
        role.permissions = new Array(role.permissions);
      roleService.add(role, function (err, res) {
        $('#addRoleDialog').modal('hide');
        roleService.getList(function (err, list) {
          if (err)
            console.log('Error: ', err);
          else
            $scope.$apply(function () {
              $scope.list = list;
            });
        });
      });
    }
  }

  $scope.roleDel = function (role) {
    $('#warning').modal('hide');
    roleService.delete(role, function () {
      roleService.getList(function (err, list) {
        if (err)
          console.log('Error: ', err);
        else
          $scope.$apply(function () {
            $scope.list = list;
          });
      });
    });

  }

  $scope.prepareAddRole = function () {
    roleService.listPermissions(function (err, perms) {
      $scope.$apply(function () {
        $scope.permList = perms;
      })
    });
  }
  $scope.dryDel = function (role) {
    $('#warning').modal();
    $scope.delroleval = role;
  }

});


joolaControllers.controller('orgCtrl', function ($scope, orgService) {
  $scope.arrayToList = function (input) {

    var li = '<ul>';
    input.forEach(function (val) {
      li += "<li>" + val + "</li>";
    });
    li += "</ul>"
    return li;
  }

  orgService.getList(function (err, list) {
    if (err)
      console.log('Error: ', err);
    else
      $scope.$apply(function () {
        $scope.list = list;
      });
  });

  $scope.orgEdit = function (org) {

    clearNgDialog('editOrgDialog');

    orgService.get(org, function (err, res) {

      $('#editOrgDialog .modal-title').text('Edit - ' + org);
      $scope.$apply(function () {
        $scope.editOrgname = res.name;
        $scope.editFilters = res._filter;
      });
      $('#editOrgDialog').modal('show');
    });


  }
  $scope.updateOrg = function () {
    var validate = [
      {"id": "orgname", "minlength": 1, "type": "text"},
      {"id": "filter", "minlength": 0, "type": "text"}
    ];
    if (validateForm('editOrgForm', validate)) {
      $('#editOrgDialog button').attr("disabled", "disabled");
      $('#editOrgDialog .spinner').css('display', 'inline-block');
      $('#editOrgDialog #orgname').removeAttr('disabled');
      var org = $('#editOrgForm').serializeObject();

      $('#editOrgDialog #orgname').attr('disabled', 'disabled');
      orgService.update(org, function (err, res) {
        $('#editOrgDialog').modal('hide');

        orgService.getList(function (err, list) {
          if (err)
            console.log('Error: ', err);
          else
            $scope.$apply(function () {
              $scope.list = list;
            });
        });

      });
    }
  }

  $scope.addOrg = function (user) {
    var validate = [
      {"id": "add_orgname", "minlength": 1, "type": "text"},
      {"id": "filter", "minlength": 0, "type": "text"}
    ];
    if (validateForm('addOrgForm', validate)) {
      $('#addOrgDialog .spinner').css('display', 'inline-block');
      var org = $('#addOrgForm').serializeObject();
      orgService.add(org, function (err, res) {
        $('#addOrgDialog').modal('hide');
        orgService.getList(function (err, list) {
          if (err)
            console.log('Error: ', err);
          else
            $scope.$apply(function () {
              $scope.list = list;
            });
        });
      });
    }
  }

  $scope.orgDel = function (org) {
    orgService.delete(org, function () {
      $('#warning').modal('hide');
      orgService.getList(function (err, list) {
        if (err)
          console.log('Error: ', err);
        else
          $scope.$apply(function () {
            $scope.list = list;
          });
      });
    });
  }

  $scope.dryDel = function (org) {
    $('#warning').modal();
    $scope.delorgval = org;
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


joolaControllers.controller('sidebar', function ($scope) {
  $('.dropdown-toggle').on('click', function() {
    console.log('toggled');
  })
});

joolaControllers.controller('settingsCtrl', function ($scope, settingsService) {
  $scope.settings = {};
  $scope.settings.interfaces = {};
  $scope.settings.interfaces.webserver = {};
  $scope.settings.interfaces.beacon = {};
  $scope.settings.interfaces.repl = {};
  
  settingsService.getSettings(function(err,res) {
    if (err)
      console.log('Error! ' + err);
    else {
      $scope.$apply(function() {
        $scope.settings.interfaces.webserver.host = res.interfaces.webserver.host;
        $scope.settings.interfaces.webserver.port = res.interfaces.webserver.port;
      });  
    }
  });
  
  $scope.saveSettings = function() {
    var validate = [
      {"id": "systemname", "minlength": 1, "type": "text"},
      {"id": "systemhost", "minlength": 1, "type": "text"},
      {"id": "systemport", "minlength": 2, "type": "text"},
      {"id": "adminemail", "minlength": 3, "type": "text"},
      {"id": "dateformat", "minlength": 1, "type": "text"}
    ];
    if (validateForm('systemsettings', validate)) {
      var settings = null;
      settingsService.updateSettings($scope.system, function() {
        console.log('updated settings successfuly');
      });
    }
  }
  $scope.purgeCache = function() {
    settingsService.purgeCache(function() {
      
    });
  }

  $scope.takeOffline = function() {
    settingsService.takeOffline(function() {

    });
  }
  
});