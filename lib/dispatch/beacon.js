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
  domain = require('domain'),
  diff = require('deep-diff').diff,
  async = require('async'),
  traverse = require('traverse'),
  router = require('../webserver/routes/index'),
  equal = require('deep-equal'),
  ce = require('cloneextend'),
  path = require('path'),
  _ = require('underscore'),
  fs = require('fs');

var etl = {};
exports.etl = etl;

etl.verify = function (context, workspace, collection, documents, callback) {
  var _document;
  if (!Array.isArray(documents))
    documents = [documents];

  if (documents.length > 0)
    _document = ce.clone(documents[0]);

  if (!_document.timestamp) {
    _document.timestamp = new Date();
  }

  joola.dispatch.collections.metadata(context, workspace, null, _document, function (err, meta) {
    /* istanbul ignore if */
    if (err)
      return setImmediate(function () {
        return callback(err);
      });

    joola.dispatch.collections.get(context, workspace, collection, function (err, _collection) {
      if (err) {
        meta.key = collection;
        meta.name = collection;

        joola.dispatch.collections.add(context, workspace, meta, function (err, _collection) {
          /* istanbul ignore if */
          if (err && err.message != 'Collection already exist') {
            return setImmediate(function () {
              return callback(err);
            });
          }
          return setImmediate(function () {
            return callback(null);
          });
        });
      }
      else {
        joola.dispatch.collections.metadata(context, workspace, collection, _document, function (err, _meta) {
          /* istanbul ignore if */
          if (err)
            return setImmediate(function () {
              return callback(err);
            });
          var differences;
          var match = equal(meta, _meta);

          if (!match) {
            differences = diff(meta, _meta);
            differences = _.filter(differences, function (diff) {
              return diff.kind !== 'N';
            });
          }
          if (differences) {
            match = differences.length === 0;
          }

          if (!match && _collection.strongTyped) {
            joola.logger.warn({category: 'beacon', diff: differences}, 'Strong-typed collection [' + collection + '] cannot be modified by Beacon.');
            return callback(new Error('Strong-typed collection [' + collection + '] cannot be modified by Beacon.'));
          }
          else if (!match) {
            differences = diff(meta, _meta);
            meta.key = collection;
            meta.name = collection;
            joola.dispatch.collections.patch(context, workspace, meta.key, meta, function (err) {
              joola.logger.debug({category: 'beacon', diff: differences}, 'Updating collection [' + collection + '] due to meta change.');
              return setImmediate(function () {
                return callback(null);
              });
            });
          }
          else {
            return setImmediate(function () {
              return callback(null);
            });
          }
        });
      }
    });
  });
};

etl.load = function (context, workspace, collection, documents, options, callback) {
  joola.dispatch.collections.metadata(context, workspace, collection, ce.clone(documents[0]), function (err, meta, _collection) {
    if (err)
      return setImmediate(function () {
        return callback(err);
      });

    _collection.meta = meta;
    _collection.storeKey = workspace + '_' + collection;

    var d = domain.create();
    d.on('error', function (err) {
      return callback('Failed to insert document: ' + err);
    });
    d.run(function () {
      joola.datastore.providers.default.insert(_collection, ce.clone(documents), options, function (err, _documents) {
        if (err) {
          return setImmediate(function () {
            console.log('aaaa');
            return callback(err);
          });
        }
        return callback(null, ce.clone(_documents));
      });
    });
  });
};

exports.insert = {
  name: "/beacon/insert",
  description: "",
  inputs: {
    required: ['workspace', 'collection', 'document'],
    optional: ['options']
  },
  _outputExample: {},
  _permission: ['beacon:insert'],
  _dispatch: {
    message: 'beacon:insert'
  },
  /*_route: function (req, res) {
    var _params = req.parsed;
    _params.document = _params.document || _params.payload;
    if (typeof _params.document === 'string') {
      try {
        _params.document = JSON.parse(_params.document);
      }
      catch (ex) {
        return router.responseError(400, new router.ErrorTemplate('Document must be a valid JSON'), req, res);
      }
    }
    if (_params.document.length > 0 && typeof _params.document[0] === 'string') {
      try {
        _params.document.forEach(function (d, i, arr) {
          arr[i] = JSON.parse(d);
        });
      }
      catch (ex) {
        return router.responseError(400, new router.ErrorTemplate('Document must be a valid JSON'), req, res);
      }
    }
    var context = {};
    context.user = req.user;
    if (!_params.workspace)
      _params.workspace = req.user.workspace;
    try {
      var _token = req.token;

      joola.dispatch.request(_token._ || _token, 'beacon:insert', _params, function (err, result, headers) {
        if (err)
          return router.responseError(500, new router.ErrorTemplate('Failed to route action [' + 'insert' + ']: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

        return router.responseSuccess(result, headers, req, res);
      });
    }
    catch (ex) {
      return router.responseError(500, new router.ErrorTemplate(ex), req, res);
    }
  },*/
  run: function (context, workspace, collection, documents, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    callback = callback || function () {
    };

    if (context.user.workspace !== workspace && context.user.permissions.indexOf('superuser') === -1) {
      var err = new Error('Forbidden');
      err.code = 403;
      return callback(err);
    }

    try {
      if (!Array.isArray(documents)) {
        documents = [documents];
      }

      var start_ts = new Date().getTime();
      var count = documents.length;

      etl.verify(context, workspace, collection, documents, function (err) {
        if (err)
          return setImmediate(function () {
            return callback(err);
          });
        etl.load(context, workspace, collection, documents, {}, function (err, documents) {
          if (err)
            return setImmediate(function () {
              return callback(err);
            });

          return setImmediate(function () {
            var end_ts = new Date().getTime();
            if (count > 1)
              joola.logger.trace('Beacon insert, count: ' + count + ', total: ' + (end_ts - start_ts) + 'ms, rate: ' + (count / (end_ts - start_ts)) + 'doc/ms');

            //if (workspace != '_stats')
            //  joola.common.stats({event: 'writes', workspace: workspace, username: context.user.username, collection: collection, writeCount: count, duration_per_doc: (count / (end_ts - start_ts))});

            return callback(null, documents);
          });
        });
      });
    }
    catch (ex) {
      /* istanbul ignore next */
      console.log('exception', ex);
      /* istanbul ignore next */
      console.log(ex.stack);

      return setImmediate(function () {
        return callback(ex);
      });
    }
  }
};

exports.insert_into_workspace = {
  name: "/beacon/insert_into_workspace",
  description: "",
  inputs: {
    required: ['collection', 'document'],
    optional: ['options']
  },
  _outputExample: {},
  _permission: ['beacon:insert'],
  _dispatch: {
    message: 'beacon:insert'
  },
  run: function (context, collection, documents, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    callback = callback || function () {
    };

    return exports.insert(context, 'workspace', collection, documents, options, callback);
  }
};