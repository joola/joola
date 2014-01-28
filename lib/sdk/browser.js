var joolaio = require('./index');


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

  joolaio.events.emit('core.init.browser-finish');
});