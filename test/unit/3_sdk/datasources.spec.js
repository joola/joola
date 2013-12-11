/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("sdk-datasources", function () {
	var _store, _bypassToken;
	before(function (done) {
		_store = joola.config.authentication.store;
		_bypassToken = joola.config.authentication.bypassToken;
		joola.config.authentication.store = 'bypass';
		joola.config.authentication.bypassToken = '123';

		joolaio.TOKEN = '123';
		done();
	});

	it("should return a valid list of data sources", function (done) {
		_sdk.dispatch.datasources.list(function (err) {
			return done();
		});
	});

	it("should add a data source", function (done) {
		_sdk.dispatch.datasources.add({name: 'testSuite-sdk', type: 'test', _connectionString: 'test'}, function (err, datasource) {
			expect(datasource).to.be.ok;
			return done(err);
		});
	});

	it("should update a data source", function (done) {
		_sdk.dispatch.datasources.update({name: 'testSuite-sdk', type: 'test2', _connectionString: 'test'}, function (err, datasource) {
			expect(datasource.type).to.equal('test2');
			return done(err);
		});
	});

	it("should delete a data source", function (done) {
		_sdk.dispatch.datasources.delete({name: 'testSuite-sdk'}, function (err) {
			if (err)
				return done(err);
			_sdk.dispatch.datasources.list(function (err, datasources) {
				var exist = _.filter(datasources, function (item) {
					return item.name == 'testSuite-sdk';
				});
				try {
					expect(exist.length).to.equal(0);
					return done(err);
				}
				catch (ex) {
					return done(ex);
				}
			})
		});
	});

	after(function (done) {
		joola.config.set('authentication:store', _store);
		joola.config.set('authentication:bypassToken', _bypassToken);
		done();
	});
});