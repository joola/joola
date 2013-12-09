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
  it("should return a valid list of data sources", function (done) {
    joola.dispatch.datasources.list(function (err) {
      return done(err);
    });
  });

  it("should add a data source", function (done) {
    joola.dispatch.datasources.add({name: 'testSuite-api', type: 'test', _connectionString: 'test'}, function (err, datasource) {
      expect(datasource).to.be.ok;
      done(err);
    });
  });

  it("should update a data source", function (done) {
    joola.dispatch.datasources.update({name: 'testSuite-api', type: 'test2', _connectionString: 'test2'}, function (err, datasource) {
      expect(datasource.type).to.equal('test2');
      done(err);
    });
  });

  xit("should delete a data source", function (done) {
    joola.dispatch.datasources.delete({name: 'testSuite-api'}, function (err) {
      joolaio.dispatch.datasources.list(function (err, datasources) {
        var exist = _.filter(datasources, function (item) {
          return item.name == 'testSuite';
        });
        try {
          expect(exist.length).to.equal(0);
          done();
        }
        catch (ex) {
          done(ex);
        }
      })
    });
  });
});