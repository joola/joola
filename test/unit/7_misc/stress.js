_joolaio = require('../../../joola.io.js');
joola.state.on('state:change', function (state) {
  if ((state == 'working' || state == 'online')) {

    var testUser = {
      username: 'test-user',
      displayName: 'testing user',
      _password: '1234',
      _roles: ['admin'],
      _filter: '',
      organization: 'testOrg'
    };

    joola.auth.generateToken(testUser, function (err, _token) {
      if (err)
        throw err;

      _sdk = require('../../../lib/sdk/index');
      var options = {
        TOKEN: _token._,
        isBrowser: false,
        debug: {
          enabled: false,
          events: {
            enabled: false,
            trace: false
          },
          functions: {
            enabled: false
          }
        }
      };
      _sdk.init(options, function (err) {
        if (err)
          throw err;

        _sdk.TOKEN = _token._;

        var iteration = 0;
        setInterval(function () {
          joolaio.dispatch.beacon.insert('serverfault', {timestamp: new Date(), id: 1234, value: 0.5});
          /*
           _sdk.dispatch.users.list(function (err, users) {
           console.log(iteration, Object.keys(users).length);
           iteration++;*/
        }, 1);

      });
    });
  }
  else if (!started)
    throw new Error('Failed to startup joola.io');
});
