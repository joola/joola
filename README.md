# joola.io [![Build Status][3]][4] [![Gitter chat](https://badges.gitter.im/joola/joola.io.png)](https://gitter.im/joola/joola.io)

| **[Technical Docs] [techdocs]**     | **[Setup Guide] [setup]**     | **[API Docs] [api-docs]**           | **[Contributing] [contributing]**           | **[About joola.io] [about]**     |
|-------------------------------------|-------------------------------|-----------------------------------|---------------------------------------------|-------------------------------------|
| [![i1] [techdocs-image]] [techdocs] | [![i2] [setup-image]] [setup] | [![i3] [api-docs-image]] [api-docs] | [![i4] [contributing-image]] [contributing] | [![i5] [about-image]] [about] |

<img src="http://i.imgur.com/Kx6l8s3.png" alt="joola.io logo" title="joola.io" align="right" />

[joola.io][22] is a real-time data analytics and visualization framework. Some of the main benefits of using joola.io include:

1. Integrate existing data-sources to correlate, analyze and visualize data.
2. Stores relevant data in a unique caching layer enabling scalable, rapid response times to queries and requests.
3. Seamlessly embeddable into existing sites, including single-sign-on and advanced features.

### Main Features

- **Big-data**, supports distributed caching and processing to cope with big-data needs.
- **Real-time** data processing. Display analytics as they arrive.
- **Fast**, advanced caching algorithm. Avg. query time of less than a few seconds.
- **Embed** quickly, seamlessly integrate with your site.
- **Scalable**, run on a single machine or a node-based matrix.
- **Secure**, role-based, multi-tenant, data segregation.
- **Extend**, easy to add more data sources, authentication and cache middleware.

### Getting Started
We've pre-loaded the package with a fully working sample site, so it's easy to get started.

joola.io uses several leading open-source software for its operation. Before getting started, please install [MongoDB](http://mongodb.org), [Redis](http://redis.io) and [RabbitMQ](http://www.rabbitmq.com/), for more details on these pre-requisites please refer to the [wiki](http://github.com/joola/joola.io/wiki/install-joola.io).  

For the example below to work out-of-the-box, it's required to have both joola.io and its dependencies installed on localhost.
 For more details on the installation process, please refer to [this guide](http://github.com/joola/joola.io/wiki/install-joola.io).

```bash
$ mkdir /opt/joola.io
$ cd /opt/joola.io
$ npm install joola.io
$ node ./node_modules/joola.io/joola.io.js

# Access REST API using cURL (-k switch due to default localhost SSL certificate)
$ curl -i -k  https://localhost:8081/system/version?APIToken=apitoken-demo

HTTP/1.1 200 OK
Server: joola.io
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: ETag, X-RateLimit-Limit, X-RateLimit-Remaining,
  X-RateLimit-Reset
X-JoolaIO-Request-Id: 87IpUGxDQ:1399738779977:0xOC0CqXB
X-Powered-By: joola.io
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4973
X-RateLimit-Reset: 1399741710
Retry-After: 2930
X-JoolaIO-Duration: 5
X-JoolaIO-Requested-By: 87IpUGxDQ
X-JoolaIO-Fulfilled-By: 87IpUGxDQ
X-JoolaIO-Duration-Fulfilled: 2
Content-Type: application/json
Content-Length: 36
ETag: "867689076"
Vary: Accept-Encoding
Date: Sat, 10 May 2014 16:19:39 GMT
Connection: keep-alive

{ "version": "joola.io version 0.4.1" }
```

Following the installation, point your browser to `https://localhost:8081` and you'll be able to use the framework.

[**Learn more about getting started with joola.io**](http://github.com/joola/joola.io/wiki/technical-documentation)

##### To push your first event

Using cURL:
```bash
$ curl --include \
     --request POST \
     --header "Content-Type: application/json" \
     --data-binary "[{
  \"timestamp\": null,
  \"article\": \"Sample Analytics\",
  \"browser\": \"Chrome\",
  \"device\": \"Desktop\",
  \"engine\": \"Webkit\",
  \"os\": \"Linux\",
  \"userid\": \"demo@joo.la\",
  \"ip\": \"127.0.0.1\",
  \"referrer\": \"http://joo.la\",
  \"visits\": 1,
  \"loadtime\": 123
}]" \
https://joolaio.apiary-mock.com/beacon/{workspace}/{collection}{?APIToken}
```

Using the SDK:
```js
var joolaio = require('joola.io.sdk');

joolaio.init({host: 'https://localhost:8081', APIToken: 'apitoken-beacon'}, function(err) {
  var doc = {
    "timestamp": null,
    "article": "Sample Analytics",
    "browser": "Chrome",
    "device": "Desktop",
    "engine": "Webkit",
    "os": "Linux",
    "userid": "demo@joo.la",
    "ip": "127.0.0.1",
    "referrer": "http://joo.la",
    "visits": 1,
    "loadtime": 123
  };
  joolaio.beacon.insert('collection-name', doc, function(err) { 
    console.log('Document saved');
  });
});
```

[**Learn more about pushing data**](http://github.com/joola/joola.io/wiki/pushing-data)

##### Your first visualization
```html
<div id="drawhere">

<script src="https://localhost:8081/joola.io.js">
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
```

[**Learn more about analytics and visualizations**](http://github.com/joola/joola.io/wiki/analytics-and-visualization)

### Contributing
We would love to get your help! We have outlined a simple [Contribution Policy][18] to support a transparent and easy merging
of ideas, code, bug fixes and features.

If you've discovered a security vulnerability in joola.io, we appreciate your help in disclosing it to us in a responsible manner via our [Bounty Program](https://hackerone.com/joola-io).

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
[api-docs-image]: https://raw.github.com/joola/joola.io/develop/docs/images/roadmap.png
[contributing-image]: https://raw.github.com/joola/joola.io/develop/docs/images/contributing.png

[about]: https://github.com/joola/joola.io/wiki/joola.io-overview
[techdocs]: https://github.com/joola/joola.io/wiki/Technical-documentation
[setup]: https://github.com/joola/joola.io/wiki/Setting-up-joola.io
[api-docs]: http://docs.joolaio.apiary.io/
[contributing]: https://github.com/joola/joola.io/wiki/Contributing
