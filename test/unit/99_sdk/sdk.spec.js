var path = require('path');

console.log('Running SDK dispatch tests from', path.join(__dirname, '../../../node_modules/joola.io.sdk/test/unit/4_dispatch/'));

require(path.join(__dirname, '../../../node_modules/joola.io.sdk/test/unit/4_dispatch/collections.spec.js'));
require(path.join(__dirname, '../../../node_modules/joola.io.sdk/test/unit/4_dispatch/config.spec.js'));
require(path.join(__dirname, '../../../node_modules/joola.io.sdk/test/unit/4_dispatch/logger.spec.js'));
require(path.join(__dirname, '../../../node_modules/joola.io.sdk/test/unit/4_dispatch/permissions.spec.js'));
require(path.join(__dirname, '../../../node_modules/joola.io.sdk/test/unit/4_dispatch/roles.spec.js'));
require(path.join(__dirname, '../../../node_modules/joola.io.sdk/test/unit/4_dispatch/system.spec.js'));
require(path.join(__dirname, '../../../node_modules/joola.io.sdk/test/unit/4_dispatch/users.spec.js'));
require(path.join(__dirname, '../../../node_modules/joola.io.sdk/test/unit/4_dispatch/workspaces.spec.js'));
/*
 require.uncache = function (moduleName) {
 // Run over the cache looking for the files
 // loaded by the specified module name
 require.searchCache(moduleName, function (mod) {
 delete require.cache[mod.id];
 });
 };

 require.searchCache = function (moduleName, callback) {
 // Resolve the module identified by the specified name
 var mod = require.resolve(moduleName);

 // Check if the module has been resolved and found within
 // the cache
 if (mod && ((mod = require.cache[mod]) !== undefined)) {
 // Recursively go over the results
 (function run(mod) {
 // Go over each of the module's children and
 // run over it
 mod.children.forEach(function (child) {
 run(child);
 });

 // Call the specified callback providing the
 // found module
 callback(mod);
 })(mod);
 }
 };

 describe("query-basic", function () {
 before(function (done) {
 global.joola_proxy = global.joolaio;
 console.log('before ', joola_proxy.USER);
 require.uncache('../7_query/query-basic.spec');
 done();
 });

 it("should run dispatch query under SDK", function (done) {
 require('../7_query/query-basic.spec');
 done();
 });
 });
 */