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
mysql.validationQuery = 'SELECT 1 AS ' + mysql.outputDelimiter + 'Result' + mysql.outputDelimiter + mysql.lineDelimiter;

mysql.validate = function (datasource, callback) {
  var validated = false;
  return mysql.open(datasource, function (err, connection) {
    if (err)
      return callback(err);

    return mysql.query(connection, mysql.validationQuery, function (err, result) {
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
  connection.query(query, function (err, rows, fields) {
    if (err)
      return callback(err);

    return callback(null, {rows: rows, fields: fields});
  });
};