/**
 *  @title joola.io/lib/common/stats
 *  @overview Provides system usage statistics for the management portal
 *  @description
 *  The `stats` object emits stats taken from redis regarding the usage of the joola.io framework.
 *
 * - [statsEvents](#statsEvents)
 * - [incr](#incr)
 *
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/


var
  joola = require('../joola.io'),
  EventEmitter2 = require('eventemitter2').EventEmitter2;

var stats = new EventEmitter2({wildcard: true, newListener: true});
stats._id = 'stats';

module.exports = exports = stats;

stats.emitInterval = 1000; //1 second
stats.ttl = 1000 * 60 * 60; //1 hour

stats.set = function (key, value, callback) {
  callback = callback || emptyfunc;

  var document = {};
  var _date = new Date();
  document.timestamp = new Date(_date);
  var bucket = {};
  _date.setMilliseconds(0);
  bucket.second = new Date(_date);
  _date.setSeconds(0);
  bucket.minute = new Date(_date);
  _date.setMinutes(0);
  bucket.hour = new Date(_date);
  _date.setUTCHours(0, 0, 0, 0);
  bucket.day = new Date(_date);
  _date.setDate(1);
  bucket.month = new Date(_date);
  _date.setMonth(1);
  bucket.year = new Date(_date);
  document.timebucket = bucket;
  document.node = joola.UID;
  document.key = key;

  Object.keys(value).forEach(function (key) {
    document[key] = value[key];
  });

  document._key = joola.common.hash(JSON.stringify(document.timestamp.toString() + document.node.toString() + document.key.toString()).toString());
  if (joola.dispatch.beacon) {
    var context = {user: {su: true, organization: 'joola'}};
    joola.dispatch.beacon.insert(context, 'internal-stats-' + key, document, callback);
  }
};