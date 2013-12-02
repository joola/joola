/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var
  router = require('./index'),
  users = require('../../objects/users'),
  user1 = require('../../objects/prototypes/user');


exports.list = {
  name: "users/list",
  description: "I list all available users",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};

    joola.dispatch.emit('users', 'list-request', {}, function (err, users) {
      if (err)
        return router.responseError(new router.ErrorTemplate('Failed to list users: ' + err), req, res);

      response.users = user;
      return router.responseSuccess(response, req, res);
    });
  }
};

exports.add = {
  name: "users/add",
  description: "I add a user",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    try {
      // if (req.params[0] instanceof Object)
      //  req.params = req.params[0];

      var options = {
        _username: req.params._username,
        displayName: req.params.displayName,
        _email: req.params._email,
        _password: req.params._password,
        _roles: req.params._roles,
        _filter: req.params._filter
      };
      var user = new user1({
        _username: req.params._username,
        displayName: req.params.displayName,
        _email: req.params._email,
        _password: req.params._password,
        _roles: req.params._roles,
        _filter: req.params._filter
      });

      joola.dispatch.emit('users', 'add-request', user, function (err, _user) {
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to store new user: ' + err), req, res);
        response.user = _user;
        return router.responseSuccess(response, req, res);
      });
    }
    catch (err) {
      return router.responseError(new router.ErrorTemplate(err), req, res);
    }
  }
};


exports.update = {
  name: "users/update",
  description: "I update a user",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    //req.params = req.params[0];
    joola.config.get('users', function (err, value) {
      if (err)
        return router.responseError(err, req, res);

      var users;
      if (!value)
        return router.responseError(new router.ErrorTemplate('No users are defined.'), req, res);

      users = value;
      var found = false;
      Object.keys(users).forEach(function (key) {
        if (key == req.params._username) {
          found = true;
          var user = new user1({
            _username: req.params._username,
            displayName: req.params.displayName,
            _email: req.params._email,
            _password: req.params._password,
            _roles: req.params._roles,
            _filter: req.params._filter
          });
          joola.dispatch.emit('users', 'update-request', user, function (err, _user) {
            if (err)
              return router.responseError(new router.ErrorTemplate('Failed to update user: ' + err), req, res);
            response.user = _user;
            return router.responseSuccess(response, req, res);
          });
        }
      });

      if (!found)
        return router.responseError(new router.ErrorTemplate('user not found.'), req, res);
    });
  }
};

exports.delete = {
  name: "users/delete",
  description: "I delete a user",
  inputs: {
    "required": ["_username"],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    //req.params = req.params[0];
    var response = {};
    joola.config.get('users', function (err, value) {
      if (err)
        return router.responseError(err, req, res);

      var users;
      if (!value)
        return router.responseError(new router.ErrorTemplate('No users are defined.'), req, res);

      users = value;
      var found = false;
      var user;
      Object.keys(users).forEach(function (key) {
        if (key == req.params._username) {
          found = true;
          user = users[key];
        }
      });

      if (!found)
        return router.responseError(new router.ErrorTemplate('user not found.'), req, res);

      delete users[req.params._username];
      joola.config.set('users', users, function (err) {
        if (err)
          return router.responseError(err, req, res);

        joola.dispatch.emit('users', 'delete', user);
        return router.responseSuccess(response, req, res);
      });
    });
  }
};

exports.describe = {
  name: "users/describe",
  description: "I describe a usere",
  inputs: {
    "required": [],
    "optional": []
  },
  outputExample: {},
  permission: ['manage_system'],
  run: function (req, res) {
    var response = {};
    response.user = user.proto;
    return router.responseSuccess(response, req, res);
  }
};