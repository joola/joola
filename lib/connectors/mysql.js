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
  _mysql = require('mysql');

var mysql = exports;

mysql.fieldDelimiter = '`';
mysql.outputDelimiter = '`';
mysql.lineDelimiter = ';';
mysql.query_validation = 'SELECT 1 AS ' + mysql.outputDelimiter + 'Result' + mysql.outputDelimiter + mysql.lineDelimiter;
mysql.meta_tables = 'select * from (' +
  'select table_schema, table_name, \'table\' as table_type from information_schema.tables where table_type=\'BASE TABLE\'' +
  'union ' +
  'select table_schema, table_name, \'view\' as table_type from information_schema.views' +
  ') as result ' +
  'where result.table_schema = \'?\'';
mysql.meta_columns = 'select column_name, ordinal_position, data_type, character_maximum_length, numeric_precision, numeric_scale from information_schema.columns where table_name = \'?\'';

mysql.validate = function (datasource, callback) {
  var validated = false;
  return mysql.open(datasource, function (err, connection) {
    if (err)
      return callback(err);

    return mysql.query(connection, mysql.query_validation, function (err, result) {
      if (err)
        return callback(err);

      if (result.rows && result.rows[0] && result.rows[0].Result == 1)
        validated = true;
      return mysql.close(connection, function (err) {
        if (err)
          return callback(err);

        return callback(null, validated);
      });
    });
  });
};

mysql.meta = function (datasource, object, callback) {
  var meta_database = function (datasource, callback) {
    var meta = {
      tables: []
    };
    mysql.fetch(datasource, mysql.meta_tables.replace('?', datasource.dbname), function (err, result) {
      if (err)
        return callback(err);

      result.rows.forEach(function (row) {
        var table = {
          type: 'table',
          name: row.table_name,
          schema: row.table_schema
        };
        meta.tables.push(table);
      });
      return callback(null, meta);
    });
  };

  var meta_table = function (datasource, object, callback) {
    if (typeof object === 'string')
      object = {type: 'table', schema: '', name: object};
    else if (typeof object === 'function') {
      callback = object;
      object = null;
    }

    var meta = {
      type: object.type,
      name: object.name,
      schema: object.schema,
      columns: []
    };
    mysql.fetch(datasource, mysql.meta_columns.replace('?', object.name), function (err, result) {
      if (err)
        return callback(err);

      result.rows.forEach(function (row) {
        var column = {
          name: row.column_name,
          ordianl: row.ordinal_position,
          type: row.data_type,
          length: row.character_maximum_length,
          precision: row.numeric_precision,
          scale: row.numeric_scale
        };
        meta.columns.push(column);
      });
      return callback(null, meta);
    });
  };

  if (object)
    return meta_table(datasource, object, callback);
  else
    return meta_database(datasource, callback);
};

mysql.open = function (datasource, callback) {
  var printout = 'tcp://' + datasource.dbuser + ':' + datasource.dbpass.replace(/./g, '*') + '@' + datasource.dbhost + ':' + (datasource.dbport || 3306) + '/' + datasource.dbname;
  joola.logger.debug('Open connection to MySQL: ' + printout);
  var connection = _mysql.createConnection({host: datasource.dbhost, user: datasource.dbuser, password: datasource.dbpass, database: datasource.dbname});

  connection.connect();
  return callback(null, connection);
};

mysql.close = function (connection, callback) {
  connection.end();
  return callback(null);
};

mysql.query = function (connection, query, callback) {
  joola.logger.trace('Executing Query: ' + query);
  connection.query(query, function (err, rows, fields) {
    if (err)
      return callback(err);

    joola.logger.trace('Query finished, results: ' + rows.length);
    return callback(null, {rows: rows, fields: fields});
  });
};

mysql.fetch = function (datasource, query, callback) {
  return mysql.open(datasource, function (err, connection) {
    if (err)
      return callback(err);

    return mysql.query(connection, query, function (err, result) {
      if (err)
        return callback(err);

      return mysql.close(connection, function (err) {
        if (err)
          return callback(err);

        return callback(null, result);
      });
    });
  });
};