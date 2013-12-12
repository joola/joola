/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("api-datasources", function () {
	before(function (done) {
		joola.config.clear('datasources:testSuite-api', function (err) {
			if (err)
				throw err;
			done();
		});
	});

	it("should return a valid list of data sources", function (done) {
		joola.dispatch.datasources.list(function (err) {
			return done(err);
		});
	});

	it("should add a data source", function (done) {
		var ds = {
			name: 'testSuite-api',
			type: 'mysql',
			dbhost: 'db.joola.io',
			dbport: 3306,
			dbname: 'master',
			dbuser: 'test',
			dbpass: 'test'
		};
		joola.dispatch.datasources.add(ds, function (err, datasource) {
			if (err)
				return done(err);
			expect(datasource).to.be.ok;
			done();
		});
	});

	it("should fail adding an existing data source", function (done) {
		var ds = {
			name: 'testSuite-api',
			type: 'mysql',
			dbhost: 'db.joola.io',
			dbport: 3306,
			dbname: 'master',
			dbuser: 'test',
			dbpass: 'test'
		};
		joola.dispatch.datasources.add(ds, function (err, datasource) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should fail to add a data source with incomplete details", function (done) {
		var ds = {
			name: 'testSuite-api',
			type: 'test'
		};
		joola.dispatch.datasources.add(ds, function (err, datasource) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});

	it("should update a data source", function (done) {
		var ds = {
			name: 'testSuite-api',
			type: 'mysql',
			dbhost: 'db.joola.io',
			dbport: 3306,
			dbname: 'master',
			dbuser: 'test2',
			dbpass: 'test2'
		};
		joola.dispatch.datasources.update(ds, function (err, datasource) {
			if (err)
				return done(err);
			expect(datasource.dbuser).to.equal('test2');
			done();
		});
	});

	it("should delete a data source", function (done) {
		var ds = {
			name: 'testSuite-api'
		};
		joola.dispatch.datasources.delete(ds, function (err) {
			if (err)
				return done(err);

			joola.dispatch.datasources.list(function (err, datasources) {
				if (err)
					return done(err);

				var exist = _.filter(datasources, function (item) {
					return item.name == 'testSuite-api';
				});
				try {
					expect(exist.length).to.equal(0);
					done();
				}
				catch (ex) {
					done(ex);
				}
			});
		});
	});

	it("should fail deleting a non existing datasource", function (done) {
		var ds = {
			name: 'testSuite-api-notexist'
		};
		joola.dispatch.datasources.delete(ds, function (err) {
			if (err)
				return done();

			return done(new Error('This should fail'));
		});
	});
});