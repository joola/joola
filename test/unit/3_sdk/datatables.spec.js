/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("sdk-datatables", function () {
	var _store, _bypassToken;
	before(function (done) {
		_store = joola.config.authentication.store;
		_bypassToken = joola.config.authentication.bypassToken;
		joola.config.set('authentication:store', 'bypass');
		joola.config.set('authentication:bypassToken', '123');

		joolaio.TOKEN = '123';

		joola.config.clear('datatables:test-table-sdk', function (err) {
			if (err)
				throw err;
			done();
		});
	});

	it("should return a valid list of data tables", function (done) {
		_sdk.dispatch.datatables.list(function (err) {
			return done(err);
		});
	});

	it("should add a data table", function (done) {
		var dt = {
      id: 'test-table-sdk',
      name: 'test-table-sdk',
      type: 'data',
      primaryKey: 'id',
      dateColumn: 'date',
      dimensions: [],
      metrics: []
		};
		_sdk.dispatch.datatables.add(dt, function (err, datatable) {
			if (err)
				return done(err);
			expect(datatable).to.be.ok;
			return done();
		});
	});

	it("should fail adding an existing data table", function (done) {
		var dt = {
      id: 'test-table-sdk',
      name: 'test-table-sdk',
      type: 'data',
      primaryKey: 'id',
      dateColumn: 'date',
      dimensions: [],
      metrics: []
		};
		_sdk.dispatch.datatables.add(dt, function (err, datatable) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should get a data table", function (done) {
		_sdk.dispatch.datatables.get('test-table-sdk', function (err, datatable) {
			if (err)
				return done(err);
			expect(datatable).to.be.ok;
			expect(datatable.name).to.equal('test-table-sdk');
			return done();
		});
	});

	it("should update a data table", function (done) {
		var dt = {
      id: 'test-table-sdk',
      name: 'test-table-sdk2',
      type: 'data',
      primaryKey: 'id',
      dateColumn: 'date',
      dimensions: [],
      metrics: []
		};
		_sdk.dispatch.datatables.update(dt, function (err, datatable) {
			if (err)
				return done(err);
			expect(datatable.name).to.equal('test-table-sdk2');
			return done();
		});
	});

	it("should delete a data table", function (done) {
		var ds = {
      name: 'test-table-sdk2'
		};
		_sdk.dispatch.datatables.delete(ds, function (err) {
			if (err)
				return done(err);
			_sdk.dispatch.datatables.list(function (err, datatables) {
				if (err)
					return done(err);

				var exist = _.filter(datatables, function (item) {
					return item.name == 'test-table-sdk2';
				});
				try {
					expect(exist.length).to.equal(0);
					return done();
				}
				catch (ex) {
					return done(ex);
				}
			})
		});
	});

	it("should fail deleting a non existing datatable", function (done) {
		var ds = {
			name: 'test-table-sdk-notexist'
		};
		joola.dispatch.datatables.delete(ds, function (err) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	})

	after(function (done) {
		joola.config.set('authentication:store', _store);
		joola.config.set('authentication:bypassToken', _bypassToken);
		done();
	});
});