# joola.io [![Build Status][3]][4] [![Coverage Status][1]][2] [![Gitter chat](https://badges.gitter.im/joola/joola.io.png)](https://gitter.im/joola/joola.io)

| **[Technical Docs] [techdocs]**     | **[Setup Guide] [setup]**     | **[Roadmap] [roadmap]**           | **[Contributing] [contributing]**           | **[About joola.io] [about]**     |
|-------------------------------------|-------------------------------|-----------------------------------|---------------------------------------------|-------------------------------------|
| [![i1] [techdocs-image]] [techdocs] | [![i2] [setup-image]] [setup] | [![i3] [roadmap-image]] [roadmap] | [![i4] [contributing-image]] [contributing] | [![i5] [about-image]] [about] |

<img src="http://i.imgur.com/Kx6l8s3.png" alt="joola.io logo" title="joola.io" align="right" />

[joola.io][22] is a realtime data analytics and visualization framework. Some of the main benefits of using joola.io include:

1. Integrate existing data-sources to correlate, analyze and visualize data.
2. Stores relevant data in a unique caching layer enabling scalable, rapid response times to queries and requests.
3. Completely embeddable into existing sites, but also ships with a state-of-the-art analytics website.

### Main Features

- **Big-data**, supports distributed caching and processing to cope with big-data needs.
- **Real-time**, real-time data processing. Display analytics as they arrive.
- **Fast**, advanced caching algorithm. Avg. query time of less than a few seconds.
- **Embed** quickly, seamlessly integrate with your site.
- **Scalable**, run on a single machine or a node-based matrix.
- **Secure**, role-based, multi-tenant, data segregation.
- **Extend** easily to add more data sources, authentication and cache middleware.

### Getting Started
We've pre-loaded the package with a fully working sample site, so it's easy to get started.

Before getting started, please install [MongoDB](http://mongodb.org), [Redis](http://redis.io) and [RabbitMQ](http://www.rabbitmq.com/). For the specific example below to work out-of-the-box, it's required to have both installed on localhost.
 For a more details on the installation process, please refer to [this guide](http://github.com/joola/joola.io/wiki/install-joola.io).

```bash
$ [sudo] npm install -g joola.io
$ joola.io
# To connect using CLI
$ jio --host=http://localhost:8080 --apitoken=apitoken-root
```

Following the installation, point your browser to `http://localhost:8080` and you'll be able to use the framework.

[**Learn more about getting started with joola.io**](http://github.com/joola/joola.io/wiki/technical-documentation)

##### To push your first event
```js
var joolaio = require('joola.io.sdk');

joolaio.init({host: 'http://localhost:8080', APIToken: 'apitoken-beacon'}, function(err) {
  var document = {
    timestamp: new Date(),
    attribute: 'I\'m an attribute',
    value: 123
  };
  joolaio.beacon.insert('collection-name', document, function(err) { 
    console.log('Document saved');
  });
});
```

[**Learn more about pushing data**](http://github.com/joola/joola.io/wiki/pushing-data)

##### Your first visualization
```html
<html>
  <body>
    <div id="drawhere">

    <script src="http://localhost:8080/joola.io.js">
    <script>
    var joolaio = require('joola.io.sdk');

    joolaio.init({host: 'http://localhost:8080', APIToken: 'apitoken-beacon'}, function(err) {
      joolaio.viz.timeline({
      	container: document.getElementById('drawhere'),
      	query: {
      		dimensions:['timestamp'],
      		metrics: ['value']
      	}
      }
    });
    </script>
  </body>
</html>
```

[**Learn more about analytics and visualizations**](http://github.com/joola/joola.io/wiki/analytics-and-visualizations)

### Contributing
We would love to get your help! We have outlined a simple [Contribution Policy][18] to support a transparent and easy merging
of ideas, code, bug fixes and features.

If you're looking for a place to start, you can always go over the list of [open issues][17], pick one and get started.
If you're feeling lost or unsure, [just let us know](#Contact).

### Contact
Contacting us is easy, ping us on one of these:

- [![Gitter chat](https://badges.gitter.im/joola/joola.io.png)](https://gitter.im/joola/joola.io)
- [@joolaio][19]
- [info@joo.la][20]
- You can even fill out a [form][21].

### License
Copyright (c) 2012-2014 Joola Smart Solutions. GPLv3 Licensed, see [LICENSE][24] for details.


[1]: https://coveralls.io/repos/joola/joola.io/badge.png?branch=develop
[2]: https://coveralls.io/r/joola/joola.io?branch=develop
[3]: https://travis-ci.org/joola/joola.io.png?branch=develop
[4]: https://travis-ci.org/joola/joola.io?branch=develop
[5]: https://david-dm.org/joola/joola.io.png
[6]: https://david-dm.org/joola/joola.io
[7]: https://david-dm.org/joola/joola.io/dev-status.png
[8]: https://david-dm.org/joola/joola.io#info=devDependencies
[9]: https://github.com/joola/joola.io.engine
[10]: https://github.com/joola/joola.io.analytics
[11]: https://github.com/joola/joola.io.sdk
[12]: https://github.com/joola/joola.io.config
[13]: https://github.com/joola/joola.io.logger
[14]: https://github.com/joola/joola.io
[15]: http://nodejs.org
[16]: http://serverfault.com/
[17]: http://https://joolatech.atlassian.net/browse/JARVIS
[18]: https://github.com/joola/joola.io/blob/master/CONTRIBUTING.md
[19]: http://twitter.com/joolaio
[20]: mailto://info@joo.la
[21]: http://joo.la/#contact
[22]: http://joola.io/
[23]: http://ci.joo.la
[24]: https://github.com/joola/joola.io/blob/master/LICENSE.md
[25]: https://joolatech.atlassian.net/wiki/display/JAD/Welcome
[26]: https://joolatech.atlassian.net/wiki/display/JAD/Getting+Started
[27]: https://joolatech.atlassian.net/wiki/display/JAD/Installing+joola.io
[28]: https://joolatech.atlassian.net/wiki/display/JAD/Developers
[29]: https://joolatech.atlassian.net/wiki/display/JAD/Developers/Coding+Guidelines

[architecture-doc]: https://github.com/joola/joola.io/wiki/Technical-architecture
[talk-to-us]: https://github.com/joola/joola.io/wiki/Talk-to-us

[about-image]: https://raw.github.com/joola/joola.io/develop/docs/images/about.png
[techdocs-image]: https://raw.github.com/joola/joola.io/develop/docs/images/techdocs.png
[setup-image]: https://raw.github.com/joola/joola.io/develop/docs/images/setup.png
[roadmap-image]: https://raw.github.com/joola/joola.io/develop/docs/images/roadmap.png
[contributing-image]: https://raw.github.com/joola/joola.io/develop/docs/images/contributing.png

[about]: https://github.com/joola/joola.io/wiki/joola.io-overview
[techdocs]: https://github.com/joola/joola.io/wiki/Technical-documentation
[setup]: https://github.com/joola/joola.io/wiki/Setting-up-joola.io
[roadmap]: https://github.com/joola/joola.io/wiki/Product-roadmap
[contributing]: https://github.com/joola/joola.io/wiki/Contributing
