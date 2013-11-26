/**
 * Created by itay on 11/20/13.
 */

var fs = require('fs');

fs.readdirSync(__dirname ).forEach(function (file) {
  return require('./' + file);
});