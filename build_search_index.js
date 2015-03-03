var
  fs = require('fs'),
  path = require('path'),
  _ = require('underscore'),
  cheerio = require('cheerio'),
  async = require('async');

var basepath = '/docs';

var walk = function (dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function (err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

walk(path.join(__dirname, './_site'), function (err, results) {
  if (err) throw err;

  results = _.filter(results, function (item) {
    return ['.html'].indexOf(path.extname(item)) > -1; //&& item.indexOf('Code-Style-Guidelines') > -1;
  });
  var json = {pages: []};
  async.map(results, function (filename, cb) {
    var title = '';
    var contents = fs.readFileSync(filename).toString('utf-8');
    var $ = cheerio.load(contents);
    if ($('.post-content').length > 0) {
      title = $('title').text();
      contents = $('.post-content').text();
      contents = contents.replace(/\n/ig, ' ');
      contents = contents.replace(/\r/ig, ' ');
      contents = contents.replace(/\r\n/ig, ' ');
    }
    else {
      contents = contents.replace(/(<([^>]+)>)/ig, ' ').replace(/\\s+/ig, ' ').trim();
      contents = contents.replace(/\n/ig, ' ');
      contents = contents.replace(/\r/ig, ' ');
      contents = contents.replace(/\r\n/ig, ' ');
    }
    if (contents.length > 0) {
      contents = contents.replace(/^\s+|\s+$/g, ''); //trim
      contents = contents.replace(/\s{2,}/g, ' '); //remove double spaces
      //contents = contents.replace(/(\b(\w{1,3})\b(\W|$))/g, ''); //remove short words
      //contents = contents.replace(/\W+/g, ' '); //remove non alphanumeric
      var page = {
        title: title.replace(' | Joola', ''),
        text: contents,
        loc: basepath + filename.replace(path.dirname(filename), ''),
        tags: ''
      };
      json.pages.push(page);

    }
    return cb(null, page);
  }, function (err, results) {
    fs.writeFileSync(path.join(__dirname, '../../pages/docs/search_index.json'), JSON.stringify(json));
  });
});