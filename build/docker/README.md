![joola](http://i.imgur.com/PrqIYX7.png)

[joola][22] is a real-time data analytics and visualization framework allowing you to quickly save, query and visualize your data.

- **Simple**, flexible and powerful JSON to describe your data and push to joola.
- Our **intuitive query** JSON syntax makes it easy to analyze or visualize your data in blazing speed.
- Seamlessly **embeddable** into existing sites, including single-sign-on and advanced features.

[![Gitter chat](https://badges.gitter.im/joola/joola.png)](https://gitter.im/joola/joola) [![Build Status][3]][4] [![Coverage Status](https://coveralls.io/repos/joola/joola/badge.svg?branch=develop)](https://coveralls.io/r/joola/joola) [![Code Climate](https://codeclimate.com/github/joola/joola/badges/gpa.svg)](https://codeclimate.com/github/joola/joola) [![Inline docs](http://inch-ci.org/github/joola/joola.svg?branch=develop)](http://inch-ci.org/github/joola/joola)

### Getting Started

**Starting a simple instance with terminal:**

    $ docker run -p 8080:8080 -it joola/joola

This instance includes `EXPOSE 8080 (http) and 8081 (https) and 22 (ssh)`.

**Starting a simple instance as damon:**

    $ docker run -p 8080:8080 -d joola/joola

We've pre-loaded the package with a fully working sample site, so it's easy to get started.

    $ open http://localhost:8080

### Contributing
We would love to get your help! We have outlined a simple [Contribution Policy][18] to support a transparent and easy merging
of ideas, code, bug fixes and features.

If you've discovered a security vulnerability in joola, we appreciate your help in disclosing it to us in a responsible manner via our [Bounty Program](https://hackerone.com/joola-io).

If you're looking for a place to start, you can always go over the list of [open issues][17], pick one and get started.
If you're feeling lost or unsure, [just let us know](#Contact).

### Contact
Contacting us is easy, ping us on one of these:

- [![Gitter chat](https://badges.gitter.im/joola/joola.png)](https://gitter.im/joola/joola)
- [@joola][19]
- You can even fill out a [form][21].

### License
Copyright (c) 2012-2015 Joola Smart Solutions. GPLv3 Licensed, see [LICENSE][24] for details.

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
[17]: https://github.com/joola/joola/issues
[18]: https://github.com/joola/joola/blob/master/CONTRIBUTING.md
[19]: http://twitter.com/joola
[21]: https://joo.la/contact
[22]: http://joola.github.io/joola
[23]: http://ci.joo.la
[24]: https://github.com/joola/joola/blob/master/LICENSE.md

[architecture-doc]: https://github.com/joola/joola/wiki/Technical-architecture
[talk-to-us]: https://github.com/joola/joola/wiki/Talk-to-us

[about-image]: https://raw.githubusercontent.com/wiki/joola/joola/images/about.png
[techdocs-image]: https://raw.githubusercontent.com/wiki/joola/joola/images/techdocs.png
[setup-image]: https://raw.githubusercontent.com/wiki/joola/joola/images/setup.png
[api-docs-image]: https://raw.githubusercontent.com/wiki/joola/joola/images/roadmap.png
[contributing-image]: https://raw.githubusercontent.com/wiki/joola/joola/images/contributing.png

[about]: https://github.com/joola/joola/wiki/joola-overview
[techdocs]: https://github.com/joola/joola/wiki/Technical-documentation
[setup]: https://github.com/joola/joola/wiki/Setting-up-joola
[api-docs]: http://docs.joola.apiary.io/
[contributing]: https://github.com/joola/joola/wiki/Contributing