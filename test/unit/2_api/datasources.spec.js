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
    joolaio.objects.datasources.list(function (err, datasources) {
      return done(err);
    });
  });

  xit("should add a data source", function () {
    joolaio.objects.datasources.add({name: 'testSuite-api', type: 'test', _connectionString: 'test'}, function (err, datasource) {
      return expect(datasource).to.be.ok;
    });
  });

  xit("should update a data source", function () {
    joolaio.objects.datasources.update({name: 'testSuite-api', type: 'test2', _connectionString: 'test2'}, function (err, datasource) {
      console.log(datasource);
      return expect(datasource.type).to.equal('test2');
    });
  });

  xit("should delete a data source", function (done) {
    joolaio.objects.datasources.delete({name: 'testSuite'}, function (err) {
      joolaio.objects.datasources.list(function (err, datasources) {
        var exist = _.filter(datasources, function (item) {
          return item.name == 'testSuite';
        });
        try {
          expect(exist).to.be.null;
          done();
        }
        catch (ex) {
          done(ex);
        }
      })
    });
  });
});