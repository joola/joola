var joolaio = require('./index');
var io = require('socket.io-browserify');

var options = {
  isBrowser: true,
  debug: {
    enabled: true,
    events: {
      enabled: false,
      trace: false
    },
    functions: {
      enabled: false
    }
  }
};

joolaio.init(options, function (err) {
  if (err)
    throw err;
  console.log('Init complete on browser.js');

  joolaio.io = io;
  joolaio.io.socket = joolaio.io.connect('http://localhost:40008');
  /*
  joolaio.io.socket.on('datasources/list:done', function (data) {
    console.log(data);
  });

  joolaio.io.socket.on('datasources/update:done', function (data) {
    console.log(data);
  });

  joolaio.io.socket.on('datasources/add:done', function (data) {
    console.log(data);
  });
  
  joolaio.viz.stam(function (err, html) {
    if (err)
      throw err;
    console.log('Finished running stam ', html);
  });*/
});