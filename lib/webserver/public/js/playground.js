joolaio.events.on('ready', function () {
  joolaio.set('APIToken', 'apitoken-user', function (err) {
    if (err)
      throw err;

    drawCollections();
  });
});

function drawCollections() {
  joolaio.collections.list(joolaio.USER.workspace, function (err, collections) {
    console.log(err, collections);
  });
}
