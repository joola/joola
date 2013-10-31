var
  fs = require('fs'),
  spawn = require('child_process').spawn,
  git = spawn('git', ["log", "--format='%aN##<%aE>'"]);

var exclusions = ['<chef@bitdeli.com>'];

var buffer = '';
git.stdout.on('data', function (data) {
  buffer += data;
});

git.stderr.on('data', function (data) {
  throw data;
});

git.on('close', function (code) {
  if (code != 0)
    return;

  var authors = [];
  var uniqueCheck = [];

  var lines = buffer.split('\n');
  lines.forEach(function (line) {
    if (uniqueCheck.indexOf(line) == -1) {
      uniqueCheck.push(line);

      var parts = line.split('##');
      var name = parts[0];
      var email = parts[1];
      if (name != '' && email != '') {
        var name = name.replace('\'', '');
        var email = email.replace('\'', '');

        if (exclusions.indexOf(email) == -1) {
          authors.push({
            name: name,
            email: email
          });
        }
      }
    }
  });

  var outputString = '### Authors ordered by first contribution.\n\n'
  authors.forEach(function (author) {
    outputString += '- ' + author.name + ' ' + author.email + '\n';
  });

  fs.writeFile("../AUTHORS.md", outputString, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log(outputString);
      console.log("The file was saved!");
    }
  });
});