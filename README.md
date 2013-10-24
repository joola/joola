# joola.io
The open-source data visualization framework.

[![Build Status][3]][4] [![dependency status][5]][6] [![dev dependency status][7]][8] [![Coverage Status][1]][2]

[![NPM](https://nodei.co/npm/joola.io.png?downloads=true&stars=true)](https://nodei.co/npm/joola.io/)

## Overview
[joola.io][22] is a distributed data processing and visualization framework. The framework is designed as an end-to-end
solution for data analytics. The framework connects to your databases and using a JSON based mapping of dimensions and
metrics, it exposes a RESTful API for querying the data. The Client SDK communicates with the engine to display,
visualize and provide insight into the data. Developers can extend the framework in many ways, add data connectors,
authentication plugins, visualizations and more.

To learn more about the framework architecture, see our [documentation site][25].

### Main Features
- **Big-data**, supports distributed caching and processing to cope with big-data needs.
- **Fast**, advanced caching algorithm. Avg. query time of less than a few seconds.
- **Integrate** quickly, seamlessly embed in your site.
- **Distributed**, run on a single machine or a node-based matrix.
- **Secure**, role-based, multi-tenant, data segregation.
- **AaaS ready**, offer Analytics as a Service to your audience.
- **Pluggable** data source, authentication and cache middleware

### Framework Components
joola.io is a distributed framework, it can be hosted on a single node or expanded to a grid. The following our the
different components composing the framework.
- [joola.io][14] - This repo. CLI and the main entry point of the framework.
- [joola.io.engine][9] - A RESTful API server holding and executing all logic relating to the framework.
- [joola.io.analytics][10] - A fully working analytics website.
- [joola.io.sdk][11] - Client side SDK to communicate with engine in a browser.
- [joola.io.config][12] - Distributed configuration node for the framework.
- [joola.io.logger][13] - Central logging node for the framework.

## Getting Started
Please see the following guides for using joola.io:
- Start with the [complete documentation][25].
- Learn about the framework [architecture][26].
- [Code documentation][28] covers developing and extending.
- Review [coding guidelines][29] if you're interested in submitting a pull-request.
- Our [CI][23] monitor, we use Jenkins for the heavy lifting.

### Quick Start
We've pre-loaded the package with a fully working sample site, so it's easy to get started.

**Before** we get started, you'll need to install [nodejs][15].
```bash
$ npm install joola.io
$ node ./node_modules/joola.io/bin/_joola.io services start
```
Following the installation, point your browser to `http://localhost:40002` and you'll be able to use the analytics site.

### Sample Site and Data
Our sample site and data are based on [serverfault's][16] archived data. It includes Q&A submitted up to a year ago.

We are looking for additional sample data sources that may highlight more features of the framework, if you know of one,
let us know [contact](#Contact).

## Bug Reports
We use [JIRA][17] as our issue tracker and project management tool.

When submitting bug reports, please make sure you provide as much information as possible, including steps to reproduce.
Each code commit relating to the ticket, will be marked, including builds and tests, so you'll have full transparency as
to the status of your issue.

## Contributing
We would love to get your help! We have outlined a simple [Contribution Policy][18] to support a transparent and easy merging
of ideas, code, bug fixes and features.

If you're looking for a place to start, you can always go over the list of [open issues][17], pick one and get started.
If you're feeling lost or unsure, [just let us know](#Contact).

## Contact
Contacting us is easy, ping us on one of these:
- [@joolaio][19]
- [info@joo.la][20]
- #joola.io on irc.freenode.net
- You can even fill out a [form][21].

## Project History
We started this project a few years ago and it evolved into its current shape over two previous versions.
Formerly known as Jarvis Analytics, the commercial version, the framework as evolved from C# to nodejs, from a single node
 to a full grid.

We are in the process of migrating the previous commercial closed source product to this open-source project.

## License
Copyright (c) 2012-2013 Joola Smart Solutions. GPLv3 Licensed, see [LICENSE][24] for details.


[1]: https://coveralls.io/repos/joola/joola.io/badge.png
[2]: https://coveralls.io/r/joola/joola.io
[3]: https://travis-ci.org/joola/joola.io.png
[4]: https://travis-ci.org/joola/joola.io
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

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/joola/joola.io/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

