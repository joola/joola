var
  ce = require('cloneextend'),
  domain = require('domain');

describe("cache-basic", function () {
  before(function (done) {
    this.base_date = new Date();
    this.context = {user: _token.user};
    this.uid = global.uid;
    this.collection = 'test-collection-basic-' + this.uid;
    this.document_visit = {
      timestamp: this.base_date,
      user: {
        id: 1,
        username: 'testuser',
        registrationDate: this.base_date
      },
      visits: {
        count: 1,
        lastVisit: this.base_date
      }
    };
    done();
  });

  var d;
  var uncaughtExceptionHandler;

  beforeEach(function () {
    d = domain.create();
    uncaughtExceptionHandler = _.last(process.listeners("uncaughtException"));
    process.removeListener("uncaughtException", uncaughtExceptionHandler);
  });

  afterEach(function () {
    d.dispose();
    process.on("uncaughtException", uncaughtExceptionHandler);
  });

  it("should insert, query once and not use cache", function (done) {
    var self = this;
    var documents = [];
    var lastDate = this.base_date;
    for (var i = 0; i < 5; i++) {
      var _document = ce.clone(this.document_visit);
      var _date = new Date(lastDate);
      _date.setSeconds(_date.getSeconds() - 1);
      _document.timestamp = new Date(_date);
      _document.user.registrationDate = new Date(_date);
      _document.visits.lastVisit = new Date(_date);
      documents.push(ce.clone(_document));
      lastDate = new Date(_date);
    }

    joola.beacon.insert(self.context, this.collection, documents, function (err) {
      var query = {
        timeframe: {
          start: lastDate,
          end: self.base_date
        },
        interval: 'second',
        dimensions: [],
        metrics: [
          {
            key: 'visits.count',
            collection: self.collection
          }
        ]
      };
      joola.query.fetch(self.context, query, function (err, documents) {
        //console.log(err, documents);
        done();
      });
    });
  });

  it("should insert more documents, query and use previous cache", function (done) {
    var self = this;
    var documents = [];
    var startDate = new Date(this.base_date);
    startDate.setSeconds(startDate.getSeconds() - 5);
    var endDate = new Date(this.base_date);
    endDate.setSeconds(endDate.getSeconds() + 1);

    var _document = ce.clone(this.document_visit);
    _document.timestamp = new Date(endDate);
    documents.push(_document);
    joola.beacon.insert(self.context, this.collection, documents, function (err) {
      var query = {
        timeframe: {
          start: startDate,
          end: endDate
        },
        interval: 'second',
        dimensions: [],
        metrics: [
          {
            key: 'visits.count',
            collection: self.collection
          }
        ]
      };
      joola.query.fetch(self.context, query, function (err, documents) {
        console.log(err, documents);
        done();
      });
    });

  });
});