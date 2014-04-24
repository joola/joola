/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

'use strict';

var
  _ = require('underscore'),
  router = require('../webserver/routes/index');

/*
 exports.set = {
 name: "/api/alerts/set",
 description: "",
 inputs: ['id', 'query', 'type', 'endpoint'],
 _outputExample: {},
 _permission: ['access_system'],
 _dispatch: {
 message: 'alerts:set'
 },
 _route: function (req, res) {

 var lastQueryEndDate;
 var timestampDimension;
 var _params = {};
 Object.keys(req.params).forEach(function (p) {
 if (p != 'resource' && p != 'action')
 _params[p] = req.params[p];
 });

 var id = _params.id;
 var query = _params.query;
 var type = _params.type;
 var endpoint = _params.endpoint;

 var aborted, timerID;

 var request = function (callback) {
 if (lastQueryEndDate && timestampDimension)
 _params.options.timeframe_force_start = lastQueryEndDate;

 if (!_params.options)
 _params = {options: query};
 joola.dispatch.request(req.token._, 'query:fetch', _params, function (err, result) {
 clearTimeout(timerID);

 if (aborted)
 return;
 if (err)
 if (callback)
 return callback(new router.ErrorTemplate('Failed to route action [' + 'fetch' + ']: ' + (typeof(err) === 'object' ? err.message : err)));
 else
 return router.responseError(new router.ErrorTemplate('Failed to route action [' + 'fetch' + ']: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

 if (result.queryplan) {
 lastQueryEndDate = new Date(result.queryplan.query.timeframe.end);
 timestampDimension = _.find(result.dimensions, function (d) {
 return d.datatype == 'date';
 });
 if (!timestampDimension)
 timestampDimension = {key: 'timestamp'};
 }

 if (callback)
 return callback(null, result);
 else
 return router.responseSuccess(result, req, res);
 });

 timerID = setTimeout(function () {
 if (callback)
 return callback(new router.ErrorTemplate('Timeout while waiting for [' + 'fetch' + ']'));
 else
 return router.responseError(new router.ErrorTemplate('Timeout while waiting for [' + 'fetch' + ']'), req, res);
 }, 60000);
 };

 var realtime = function () {
 request(function (err, result) {
 if (err)
 return;

 if (res.socket.disconnected)
 clearInterval(intervalID);
 else {
 if (result.documents.length > 0) {
 console.log('beam', result.documents);
 var beam = [];
 result.documents.forEach(function (document) {
 beam.push(document.fvalues);
 });

 switch (type) {
 case 'hook':
 var parts = require('url').parse(endpoint);
 var options = {
 host: parts.hostname,
 port: parts.port,
 secure: parts.protocol !== 'http:',
 path: endpoint,
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 }
 };
 try {
 var prot = options.secure ? require('https') : require('http');
 var req = prot.request(options, function (res) {

 });
 req.on('finish', function () {
 joola.logger.info('Alert [' + id + '] triggered and hook notified.');
 });
 req.on('error', function (err) {
 joola.logger.warn('Alert [' + id + '] failed to access hook: ' + err);
 });
 req.write(JSON.stringify(beam));
 req.end();
 }
 catch (ex) {
 joola.logger.warn('Alert [' + id + '] failed to access hook: ' + ex);
 joola.logger.trace(ex.stack);
 }

 break;
 default:
 break;
 }
 }
 }
 //setTimeout(realtime, 1000);
 });
 };
 var interval = 1000;
 var intervalID = setInterval(realtime, interval);
 return router.responseSuccess({set: 1}, req, res);
 },
 run: function (context, query, type, endpoint, callback) {
 callback = callback || function(){};

 return callback();
 }
 };
 */