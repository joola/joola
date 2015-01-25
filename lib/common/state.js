/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  joola = require('../joola'),
  EventEmitter2 = require('eventemitter2').EventEmitter2;

var state = new EventEmitter2({wildcard: true, newListener: true});
state._id = 'state';

module.exports = exports = state;

state.controls = {
  'core': {state: 'working', message: ''},
  'runtime-redis': {state: null, message: null},
  'socketio-redis': {state: null, message: null},
  'test': {state: 'working', message: ''},
  'config-redis': {state: null, message: null},
  'subscriber': {state: null, message: null},
  'publisher': {state: null, message: null},
  'webserver-http': {state: null, message: null},
  'webserver-https': {state: null, message: null},
  'dispatch': {state: null, message: null}
};

state.set = function (control, state, details) {
  if (!this.controls[control])
    this.controls[control] = {};

  if (this.controls[control].state != state) {
    if (state != 'working' && state != 'online')
      joola.logger.warn('State for [' + control + '] changed to [' + state + ']: ' + details);
    else if (this.controls[control].state)
      joola.logger.debug('State for [' + control + '] changed to [' + state + ']: ' + details);
    else
      joola.logger.debug('State for [' + control + '] changed to [' + state + ']: ' + details);
    this.controls[control].state = state;
    this.controls[control].message = details;
  }
};

var state_local = 'working';
state.get = function () {
  var self = this;
  var result =
  {
    status: state_local,
    controls: {}
  };

  Object.keys(state.controls).forEach(function (key) {
    if (result.status != state.controls[key].state && state.controls[key].state && state.controls[key].state != 'working' && state.controls[key].state != 'online') {
      result.status = 'failure';
      if (state.controls[key].state == 'stop')
        result.status = 'stop';
      result.controls[key] = self.controls[key];
    }
    else if (result.status == 'working' && state.controls[key].state != 'working')
      result.status = state.controls[key].state;
  });
  return result;
};