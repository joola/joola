var Config = require('../lib/common/zk-config');

new Config({
  connectionString: 'localhost:2181'
}, function (err, ref) {
  if (err)
    throw err;

  //console.log('done');
  //console.log(ref.get('test'));
  ref.set('test', 'test' + process.env.TEST);
  //console.log(ref.get('test'));
  setTimeout(function () {
    ref.set('test', 'test' + process.env.TEST);
  }, 1000)
  setTimeout(ref.close, 15000);
}).on('ready', function () {
    console.log('ready');
  }).on('log', function (message) {
    console.log('message', message);
  }).on('state', function (state) {
    console.log('state change', state);
  }).on('change', function (change) {
    console.log('config change', change.key, change.value);
  });

