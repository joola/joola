var
  fs = require('fs'),
  path = require('path'),
  _ = require('underscore'),
  cheerio = require('cheerio'),
  async = require('async');

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

function capitaliseFirstLetter(string) {
  var exclusions = ['cla','qa','api'];
  if (string.length <= 3)
    return string;
  if (exclusions.indexOf(string) > -1)
    return string.toUpperCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
}

walk(path.join(__dirname, '../../pages/docs'), function (err, results) {
  if (err) throw err;

  results = _.filter(results, function (item) {
    return path.extname(item) === '.html'; //&& item.indexOf('Code-Style-Guidelines') > -1;
  });
  async.map(results, function (filename, cb) {
    var contents = fs.readFileSync(filename).toString('utf-8');
    var $ = cheerio.load(contents);

    var $top = $('a[name="top"]');
    if ($top.length > 0) {
      $($('p')[0]).remove();
    }

    var $path = $($('p')[0]);
    var $home = $path.find('a:first-of-type');
    if ($home && $home.text() === 'HOME') {
      var $crumbs = $path.find('a');
      var path = [];
      $crumbs.each(function (i, item) {
        var $item = $(item);
        path.push({
          link: $item.attr('href'),
          text: $item.text()
        });
      });
      $crumbs = $path.find('strong');
      $crumbs.each(function (i, item) {
        var $item = $(item);
        path.push({
          link: $item.attr('href'),
          text: $item.text()
        });
      });
      var docPath = '';
      path.forEach(function (item, i) {
        if (i < path.length - 1)
          docPath += '<a class="internal present" href="' + item.link + '">' + capitaliseFirstLetter(item.text.toLowerCase()) + '</a> > ';
      });
      $path.remove();
      contents = $.html();
      contents = contents.replace('%%page.title%%', capitaliseFirstLetter(path[path.length - 1].text.toLowerCase()));
      path.pop();
      docPath = JSON.stringify(path);
      contents = contents.replace('%%page.path%%', docPath);
      contents = contents.replace('%%page.description%%', '');
      fs.writeFileSync(filename, contents);
    }
    else if (filename.indexOf('Home') > -1) {
      contents = contents.replace('%%page.title%%', 'Documentation');
      contents = contents.replace('%%page.description%%', 'Learn all about harnessing Joola for your product.');
      contents = contents.replace('%%page.path%%', '');
      fs.writeFileSync(filename, contents);
    }
    else {
      console.error('Failed to locate path for a documentation file', filename);
      contents = contents.replace('%%page.title%%', '');
      contents = contents.replace('%%page.path%%', '');
      contents = contents.replace('%%page.description%%', '');
      fs.writeFileSync(filename, contents);
    }
  }, function (err, results) {
    console.log('done');
  });
});