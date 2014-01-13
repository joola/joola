[**HOME**](Home) > **TECHNICAL DOCUMENTATION**

The techincal documentation review the joola.io architecture, know-how and details breakdown of internal processes.

## Getting started
Getting started with joola.io is as easy as installing the package.
We've pre-loaded the package with a fully working sample site, so you can get a feel the system and its features.

```bash
$ npm install -g joola.io
$ joola.io --demo
```
Once the package is installed, point your browser to `http://localhost:8080` and you'll be able to use the analytics site.

For a more in-depth guide, we have the [Setup Guide](setting-up-joola.io).

## Subsystems
We've tried to keep things simple and divided the framework into the listed logical entities, each is aimed at serving a different aspect of the framework.

- [Core](subsystem-core) - Internal processes
- [Common](subsystem-common) - Shared modules and code
- [Dispatch](subsystem-dispatch) - The grid messaging system
- [Query](subsystems-query) - Manages the aspects of querying the system
- [Beacon](subsystems-beacon) - Handles the framework's internal cache
- [Authentication](subsystems-auth) - All authentication aspects of the framework
- [Web Server](subsystems-webserver) - Serves web content to end users
- [SDK](subsystems-sdk) - Used to communicate with joola.io framework and manage it

## The development process
We aim to create the world's best mass-scale data analytics framework and for that, we need to have a solid and robust development process.
This section describes the process and protocols we use throughout the development of the framework.

- [The development process](development-process-overview)
- [Testing](development-testing)
- [Building](development-building)
- [Versioning](development-versioning)
- [Release and publish](build-overview)
- [[Contributing]]
- [Roadmap](product-roadmap)

## Code documentation
This wiki also includes a [_jsdoc_ section](code-documentation), in which code comments are taken directly from the source and published to the wiki in a formatted manner.
