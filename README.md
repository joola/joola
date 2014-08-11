# joola [![Build Status][3]][4] [![Gitter chat](https://badges.gitter.im/joola/joola.png)](https://gitter.im/joola)

| **[Technical Docs] [techdocs]**     | **[Setup Guide] [setup]**     | **[API Docs] [api-docs]**           | **[Contributing] [contributing]**           | **[About joola] [about]**     |
|-------------------------------------|-------------------------------|-----------------------------------|---------------------------------------------|-------------------------------------|
| [![i1] [techdocs-image]] [techdocs] | [![i2] [setup-image]] [setup] | [![i3] [api-docs-image]] [api-docs] | [![i4] [contributing-image]] [contributing] | [![i5] [about-image]] [about] |

<img src="http://i.imgur.com/Kx6l8s3.png" alt="joola logo" title="joola" align="right" />

[joola][22] is a real-time data analytics and visualization framework allowing you to quickly save, query and visualize your data. 
Some of the main benefits of using joola include:

- **Simple**, flexible and powerful JSON to describe your data and push to joola.
- Our **intuitive query** JSON syntax makes it easy to analyze or visualize your data in blazing speed. 
- Seamlessly **embeddable** into existing sites, including single-sign-on and advanced features.

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

joola uses several leading open-source software for its operation. Before getting started, please install [MongoDB](http://mongodb.org), [Redis](http://redis.io) and [RabbitMQ](http://www.rabbitmq.com/), for more details on these pre-requisites please refer to the [wiki](http://github.com/joola/joola/wiki/install-joola).  

For the example below to work out-of-the-box, it's required to have both joola and its dependencies installed on localhost.
 For more details on the installation process, please refer to [this guide](http://github.com/joola/joola/wiki/install-joola).

#### Using Vagrant
We have included a [Vagrant](http://www.vagrantup.com) file to support easy playing around and testing. Running `vagrant up` will install all needed dependencies and run joola for you in a sand boxed virtual environment. 

```bash
# Clone this repository
$ git clone https://github.com/joola/joola
$ cd joola

$ vagrant up
# wait for the box to come online
$ vagrant ssh 

# once in the box
$ cd /opt/joola/node_modules/joola
$ node joola.js
```

We have configured the VM to use 2 CPUs with 2048MB of memory, but these can be configured from `Vagrantfile` if you prefer different settings.  

#### Install via NPM

```bash
$ mkdir /opt/joola
$ cd /opt/joola
$ npm install joola
$ node ./node_modules/joola/joola.js
```

Access REST API using cURL (-k switch due to default localhost SSL certificate)

```bash
$ curl -i -k  https://localhost:8081/system/version?APIToken=apitoken-demo

HTTP/1.1 200 OK
Server: joola
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: ETag, X-RateLimit-Limit, X-RateLimit-Remaining,
  X-RateLimit-Reset
X-joola-Request-Id: 87IpUGxDQ:1399738779977:0xOC0CqXB
X-Powered-By: joola
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4973
X-RateLimit-Reset: 1399741710
Retry-After: 2930
X-joola-Duration: 5
X-joola-Requested-By: 87IpUGxDQ
X-joola-Fulfilled-By: 87IpUGxDQ
X-joola-Duration-Fulfilled: 2
Content-Type: application/json
Content-Length: 36
ETag: "867689076"
Vary: Accept-Encoding
Date: Sat, 10 May 2014 16:19:39 GMT
Connection: keep-alive

{ "version": "joola version 0.4.1" }
```

Following the installation, point your browser to `https://localhost:8081` and you'll be able to use the framework.

[**Learn more about getting started with joola**](http://github.com/joola/joola/wiki/technical-documentation)

##### To push your first event

Using cURL:
```bash
$ curl \
     --include \
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
     https://localhost:8081/beacon/{workspace}/{collection}{?APIToken}
```

Using the SDK:
```js
var joola = require('joola.sdk');

joola.init({host: 'https://localhost:8081', APIToken: 'apitoken-beacon'}, function(err) {
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
  joola.beacon.insert('collection-name', doc, function(err) { 
    console.log('Document saved');
  });
});
```

[**Learn more about pushing data**](http://github.com/joola/joola/wiki/pushing-data)

##### Your first visualization
```html
<script src="https://localhost:8081/joola.js?APIToken=apitoken-demo"></script>
<script>
joola.events.on('ready', function(err) {
  if (err)
    throw err;
    
  var options = {
    caption: 'Visits over Time',
    query: {
      timeframe: 'last_hour',
      interval: 'minute',
      dimensions: ['timestamp'],
      metrics: ['visits'],
      collection: 'collection-demo'
    }
  }
  $('<div></div>').Timeline(options).appendTo('body');
});
</script>
```

[**Learn more about analytics and visualizations**](http://github.com/joola/joola/wiki/analytics-and-visualization)

### Contributing
We would love to get your help! We have outlined a simple [Contribution Policy][18] to support a transparent and easy merging
of ideas, code, bug fixes and features.

If you've discovered a security vulnerability in joola, we appreciate your help in disclosing it to us in a responsible manner via our [Bounty Program](https://hackerone.com/joola-io).

If you're looking for a place to start, you can always go over the list of [open issues][17], pick one and get started.
If you're feeling lost or unsure, [just let us know](#Contact).

### Contact
Contacting us is easy, ping us on one of these:

- [![Gitter chat](https://badges.gitter.im/joola/joola.png)](https://gitter.im/joola)
- [@joola][19]
- [info@joo.la][20]
- You can even fill out a [form][21].

### License
Copyright (c) 2012-2014 Joola Smart Solutions. GPLv3 Licensed, see [LICENSE][24] for details.


[1]: https://coveralls.io/repos/joola/joola/badge.png?branch=develop
[2]: https://coveralls.io/r/joola/joola?branch=develop
[3]: https://travis-ci.org/joola/joola.png?branch=develop
[4]: https://travis-ci.org/joola/joola?branch=develop
[5]: https://david-dm.org/joola/joola.png
[6]: https://david-dm.org/joola/joola
[7]: https://david-dm.org/joola/joola/dev-status.png
[8]: https://david-dm.org/joola/joola#info=devDependencies
[9]: https://github.com/joola/joola.engine
[10]: https://github.com/joola/joola.analytics
[11]: https://github.com/joola/joola.sdk
[12]: https://github.com/joola/joola.config
[13]: https://github.com/joola/joola.logger
[14]: https://github.com/joola/joola
[15]: http://nodejs.org
[16]: http://serverfault.com/
[17]: http://https://joolatech.atlassian.net/browse/JARVIS
[18]: https://github.com/joola/joola/blob/master/CONTRIBUTING.md
[19]: http://twitter.com/joola
[20]: mailto://info@joo.la
[21]: http://joo.la/#contact
[22]: http://joola/
[23]: http://ci.joo.la
[24]: https://github.com/joola/joola/blob/master/LICENSE.md
[25]: https://joolatech.atlassian.net/wiki/display/JAD/Welcome
[26]: https://joolatech.atlassian.net/wiki/display/JAD/Getting+Started
[27]: https://joolatech.atlassian.net/wiki/display/JAD/Installing+joola
[28]: https://joolatech.atlassian.net/wiki/display/JAD/Developers
[29]: https://joolatech.atlassian.net/wiki/display/JAD/Developers/Coding+Guidelines

[architecture-doc]: https://github.com/joola/joola/wiki/Technical-architecture
[talk-to-us]: https://github.com/joola/joola/wiki/Talk-to-us

[about-image]: https://raw.github.com/joola/joola/develop/docs/images/about.png
[techdocs-image]: https://raw.github.com/joola/joola/develop/docs/images/techdocs.png
[setup-image]: https://raw.github.com/joola/joola/develop/docs/images/setup.png
[api-docs-image]: https://raw.github.com/joola/joola/develop/docs/images/roadmap.png
[contributing-image]: https://raw.github.com/joola/joola/develop/docs/images/contributing.png

[about]: https://github.com/joola/joola/wiki/joola-overview
[techdocs]: https://github.com/joola/joola/wiki/Technical-documentation
[setup]: https://github.com/joola/joola/wiki/Setting-up-joola
[api-docs]: http://docs.joola.apiary.io/
[contributing]: https://github.com/joola/joola/wiki/Contributing
