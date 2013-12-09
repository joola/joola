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

var
  mongodb = require('mongodb'),
  Client = require('mongodb').MongoClient,
  Server = require('mongodb').Server;

var Duplex = require('stream').Duplex;
var mongo = exports;

joola.common.inherits(mongo, Duplex);
mongo.stores = {};
mongo.clients = {};
mongo.collections = {};

mongo.collection = function (store, collection, callback) {
  callback = callback || emptyfunc;

  if (mongo.collections[store + ':' + collection])
    return mongo.collections[store + ':' + collection];

  if (!joola.config.store[store])
    return new Error('Failed to locate store with name [' + store + ']');

  if (!mongo.clients[store]) {
    joola.logger.silly('Open mongo connection @ ' + joola.config.store[store].mongo.host + ':' + joola.config.store[store].mongo.port + '#' + joola.config.store[store].mongo.db);
    mongo.stores[store] = new Client(new Server(joola.config.store[store].mongo.host, joola.config.store[store].mongo.port));
  }
  if (!mongo.clients[store]) {
    mongo.stores[store].open(function (err, mongoClient) {
      mongo.clients[store] = mongoClient;
      var db = mongo.clients[store].db(joola.config.store[store].mongo.db);

      if (joola.config.store[store].mongo.user)
        db.auth(joola.config.store[store].mongo.user, joola.config.store[store].mongo.password);

      db.createCollection(collection, {}, function (err, collection) {
        mongo.collections[store + ':' + collection] = collection;
        return callback(err, collection);
      });
    });
  }
  else {
    var db = mongo.clients[store].db(joola.config.store[store].mongo.db);

    if (joola.config.store[store].mongo.user)
      db.auth(joola.config.store[store].mongo.user, joola.config.store[store].mongo.password);

    db.createCollection(collection, {}, function (err, collection) {
      mongo.collections[store + ':' + collection] = collection;
      return callback(err, collection);
    });
  }
};

mongo.insert = function (store, collection, documents, options, callback) {
  callback = callback || emptyfunc;

  mongo.collection(store, collection, function (err, collection) {
    if (err)
      return callback(err);

    if (!collection)
      return callback(new Error('Failed to insert document(s) into collection [' + collection + ']@[' + store + ']'));

    return collection.insert(documents, options, callback);
  });
};

mongo.find = function (store, collection, query, options, callback) {
  callback = callback || emptyfunc;

  mongo.collection(store, collection, function (err, collection) {
    if (err)
      return callback(err);

    if (!collection)
      return callback(new Error('Failed to find documents in collection [' + collection + ']@[' + store + ']'));

    collection.find(query, options).toArray(function (err, result) {
      return callback(null, result);
    });
  });
};