The following section details the JSDoc part of each code file included within the project.
During development, each function, property, event, etc... is documented with a short JSdoc set of tags, these are later
processed during the `build` process and exported as an Markdown format to form the wiki you're viewing now.

### Structure
The strucuture aligns with the `lib` folder of the project's code, each file as its functions, properties, methods and events
detailed with all relevant documentation and know-how.

- *common*
	- [benchmark.js](joola.lib.common.benchmark)
	- [cli.js](joola.lib.common.cli)
	- [config.js](joola.lib.common.config)
	- [domain.js](joola.lib.common.domain)
	- [events.js](joola.lib.common.events)
	- [globals.js](joola.lib.common.globals)
	- [index.js](joola.lib.common.index)
	- [logger.js](joola.lib.common.logger)
	- [mongo.js](joola.lib.common.mongo)
	- [redis.js](joola.lib.common.redis)
	- [repl.js](joola.lib.common.repl)
	- [state.js](joola.lib.common.state)
	- [stats.js](joola.lib.common.stats)
	- [watchers.js](joola.lib.common.watchers)
- *dispatch*
	- [datasources.js](joola.lib.dispatch.datasources)
	- [index.js](joola.lib.dispatch.index)
	- [logger.js](joola.lib.dispatch.logger)
- *sdk*
	- [browser.js](JSDoc - joola.io:lib:webserver:routes:index)
	- [index.js](JSDoc - joola.io:lib:webserver:routes:index)
	- *common*
		- [api.js](joola.lib.sdk.common.api)
		- [config.js](joola.lib.sdk.common.config)
		- [dispatch.js](joola.lib.sdk.common.dispatch)
		- [logger.js](joola.lib.sdk.common.logger)
		- [state.js](joola.lib.sdk.common.state)
- *webserver*
	- [index.js](JSDoc - joola.io:lib:webserver:routes:index)
	- *middleware*
		- [api.js](joola.lib.webserver.middleware.api)
		- [auth.js](joola.lib.webserver.middleware.auth)
		- [error.js](joola.lib.webserver.middleware.error)
		- [status.js](joola.lib.webserver.middleware.status)
  - *public*
		- [public.js](joola.lib.webserver.public)
  - *routes*
		- [index.js](JSDoc - joola.io:lib:webserver:routes:index)
  - *views*
		- [public.js](joola.lib.webserver.views)



#### Building the code documentation
For details on building the JSdoc portion of the wiki please refer to the [build] instructions.




[build]: [joola.io overview](Building-documentation)