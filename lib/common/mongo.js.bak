/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */

'use strict';

var
  joola = require('../joola.io'),

  ce = require('cloneextend'),
  url = require('url'),
  mongodb = require('mongodb'),
  Client = require('mongodb').MongoClient,
  Server = require('mongodb').Server;

var Duplex = require('stream').Duplex;
var mongo = exports;

joola.common.inherits(mongo, Duplex);
mongo.stores = {};
mongo.clients = {};
mongo.collections = {};
mongo.dbs = {};

mongo.db = function (store, callback) {
  var storename = store;

  var dsn = joola.config.get('store:' + storename + ':mongo:dsn');
  var host = joola.config.get('store:' + storename + ':mongo:host');

  var port = joola.config.get('store:' + storename + ':mongo:port');
  var dbname;
  if (dsn)
    dbname = url.parse(dsn).path.replace('/', '');
  else
    dbname = joola.config.get('store:' + storename + ':mongo:db');
  var user = joola.config.get('store:' + storename + ':mongo:user');
  var password = joola.config.get('store:' + storename + ':mongo:password');

  if (!joola.config.get('store:' + storename))
    return callback(new Error('Failed to locate store with name [' + store + ']'));
  if (!mongo.clients[storename]) {
    if (dsn) {
      joola.logger.silly('Open mongo connection @ ' + dsn);
      var client = new Client();
      mongo.stores[storename] = client.connect(dsn, function (err, db) {
        if (err)
          return callback(err);
        mongo.clients[storename] = client;

        mongo.dbs[storename] = db;
        /* istanbul ignore if */
        if (user)
          db.auth(user, password);

        return callback(null, db);
      });
    }
    else {
      joola.logger.silly('Open mongo connection @ ' + host + ':' + port + '#' + dbname);
      mongo.stores[storename] = new Client(new Server(host, port));
      mongo.stores[storename].open(function (err, mongoClient) {
        if (err)
          return callback(err);
        mongo.clients[storename] = mongoClient;
        try {
          var db = mongo.clients[storename].db(dbname);
          mongo.dbs[storename] = db;
          /* istanbul ignore if */
          if (user)
            db.auth(user, password);

          return callback(null, db);
        }
        catch (ex) {
          /* istanbul ignore next */
          return callback(ex);
        }
      });
    }
  }
  else {
    //joola.logger.silly('Found cached mongo connection @ ' + joola.config.store[storename].mongo.host + ':' + joola.config.store[storename].mongo.port + '#' + joola.config.store[storename].mongo.db);
    var db = mongo.clients[store].db(dbname);
    /* istanbul ignore if */
    if (user)
      db.auth(user, password);

    return callback(null, db);
  }
};

mongo.collection = function (store, collection, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  callback = callback || function () {
  };
  if (!options)
    options = {};

  var storename = store;
  var _collection = collection;

  var unique = joola.config.get('store:' + storename + ':mongo:unique');
  var expireafterseconds = joola.config.get('store:' + storename + ':mongo:expireafterseconds');

  mongo.db(store, function (err, db) {
    if (err)
      return callback(err);
    var mongoOptions = {strict: true};
    db.createCollection(collection, mongoOptions, function (err, collection) {
      /* istanbul ignore if */
      if (err) {
        if (err && err.message && err.message.toLowerCase().indexOf('already exist') > -1) {
          //ignore
          collection = db.collection(_collection);
          return callback(null, collection, db);
        }
        else {
          console.log('err', err);
          return callback(err);
        }
      }
      mongo.collections[storename + ':' + collection.collectionName] = collection;
      var keyIndexOptions;
      if (mongoOptions.hasOwnProperty('unique'))
        keyIndexOptions = {
          unique: unique
        };
      else
        keyIndexOptions = {
          unique: true
        };

      collection.ensureIndex({_key: 1}, keyIndexOptions, function (err) {
        /* istanbul ignore if */
        if (err)
          return callback(err);

        collection.ensureIndex({timestamp: 1}, {}, function (err) {
          /* istanbul ignore if */
          if (err)
            return callback(err);
          var expireafterseconds = expireafterseconds || options.expireafterseconds || null;
          if (expireafterseconds && expireafterseconds > 0) {
            collection.ensureIndex({ ourTimestamp: 1 }, { expireafterseconds: expireafterseconds }, function (err) {
              /* istanbul ignore if */
              if (err)
                return callback(err);
              return callback(null, collection, db);
            });
          }
          else
            return callback(null, collection, db);
        });
      });
    });
  });
};

mongo.insert = function (store, collection, documents, options, callback) {
  callback = callback || function () {
  };

  if (!Array.isArray(documents))
    documents = [documents];

  var individualInsert = function (collection, documents, callback) {
    //we have an array of documents failing over duplicates, try one by one.
    var expected = documents.length;
    var aborted = false;
    documents.forEach(function (document) {
      if (!aborted) {
        collection.insert(document, options, function (err, result) {
          expected--;
          document.saved = err ? false : true;
          document.error = err ? err.message : null;
          if (err && err.code == 11000) {
            //ignore
          }
          else if (err) {
            aborted = true;
            return callback(err);
          }
          if (expected <= 0 && !aborted) {
            return callback(null, documents);
          }
        });
      }
    });
  };

  mongo.collection(store, collection, options, function (err, collection) {
    /* istanbul ignore if */
    if (err) {
      console.log('err', err);
      return callback(err);
    }

    /* istanbul ignore if */
    if (!collection)
      return callback(new Error('Failed to insert document(s) into collection [' + collection + ']@[' + store + ']'));

    return collection.insert(documents, options, function (err, result) {
      if (err && err.code == 11000 && Array.isArray(documents)) {
        individualInsert(collection, documents, callback);
      }
      else if (err && err.toString().indexOf('maximum allowed bson size') > -1) {
        individualInsert(collection, documents, callback);
      }
      else if (err) {
        require('util').inspect(err);
        return callback(err);
      }
      else {
        documents.forEach(function (doc) {
          doc.saved = true;
        });
        return callback(null, result);
      }
    });
  });
};

mongo.update = function (store, collection, filter, update, options, callback) {
  callback = callback || function () {
  };

  mongo.collection(store, collection, options, function (err, collection) {
    /* istanbul ignore if */
    if (err)
      return callback(err);
    /* istanbul ignore if */
    if (!collection)
      return callback(new Error('Failed to insert document(s) into collection [' + collection + ']@[' + store + ']'));

    return collection.update(filter, update, options, callback);
  });
};

mongo.find = function (store, collection, query, options, callback) {
  callback = callback || function () {
  };

  mongo.collection(store, collection, {}, function (err, collection) {
    /* istanbul ignore if */
    if (err)
      return callback(err);
    /* istanbul ignore if */
    if (!collection)
      return callback(new Error('Failed to find documents in collection [' + collection + ']@[' + store + ']'));

    collection.find(query, options).toArray(function (err, result) {
      return callback(err, result);
    });
  });
};

mongo.aggregate = function (store, collection, query, options, callback) {
  callback = callback || function () {
  };

  mongo.collection(store, collection, {}, function (err, collection) {
    if (err)
      return callback(err);

    if (!collection)
      return callback(new Error('Failed to find documents in collection [' + collection + ']@[' + store + ']'));

    collection.aggregate(query, options, function (err, result) {
      return callback(err, result);
    });
  });
};

mongo.drop = function (store, collection, callback) {
  mongo.collection(store, collection, {}, function (err, collection, db) {
    if (err)
      return callback(err);
    db.dropCollection(collection.collectionName, callback);
  });
};


mongo.findAndModify = function (store, collection, query, update, callback) {
  callback = callback || function () {
  };

  mongo.collection(store, collection, {}, function (err, collection) {
    if (err)
      return callback(err);

    if (!collection)
      return callback(new Error('Failed to find documents in collection [' + collection + ']@[' + store + ']'));

    collection.findAndModify(query, null, update, {upsert: false, new: true}, function (err, result) {
      return callback(err, result);
    });
  });
};

mongo.dropDatabase = function (store, callback) {
  mongo.db(store, function (err, db) {
    if (err)
      return callback(err);
    return db.dropDatabase(callback);
  });
};