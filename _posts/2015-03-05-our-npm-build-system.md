---
layout: post_no_sidebar
title:  "Our npm build system"
date:   2015-03-05 12:14:42
author: Itay Weinberger
categories: blog
tags: packaging build
---

Here at Joola we already rely heavily on [Travis CI](http://travis-ci.org) to manage our CI cycle, we use it to build and test the code and upon certain conditions deploy it to target environments.
Travis uses a predefined set of steps to build and test our code, since we're using Node.JS, it will execute `npm install` and `npm test` (by default) to build and test our code. 
Up to a few weeks ago, our project had a `Makefile` containing the different steps needed to build and test the code. 
But this wasn't a clean process and didn't offer the flexibility we wished to have to run multiple-scenario tests. 
 
 
 
Here's an example of the `npm test` process:

```js
{
  "name": "joola",
  "version": "0.8.6",
  "description": "The open-source data visualization framework",
  "scripts": {
    "test": "make test",
    "start": "node ./joola.js",
    "coveralls": "make test-coveralls"
  }
```

And the complementary Makefile:

```bash
REPORTER=spec

test:
		$(MAKE) lint
		@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER)
lint:
		@./node_modules/.bin/jshint ./lib ./test
```

We thought about migrating to [grunt](http://gruntjs.com/) or [gulp](http://gulpjs.com/), which offer each in its own way a flexible and standard manner to structure the build and test process. And all the cool kids use one of them. 

We already use grunt to build our SDK, so naturally we went in that direction, but then I stumbled upon [this blog post](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/) by Keith Cirkel, *"How to Use npm as a Build Tool"*.
 The idea raised in the post was to **use npm itself as the build system**, i.e. introduce specific scripts to `package.json` that structure the needed builds and tests. 
 We already had some very basic scripts in `package.json`, but it was very different than what the post suggested, a full fledged build process.
  
I bet many developers would argue that `npm scripts` cannot compete with the awesomeness of grunt and gulp, however the post does raise solid arguments and counter examples which (for me) made sense.
 I started with a small experiment to see how easy migration would be and found this approach to be so easy and straightforward that I just went on going until I covered all of our needs and more.
 
Let's take an example from our current `package.json`:

```js
"scripts": {
  "test:quiet": "JOOLA_CONFIG_STORE_LOGGER_CONSOLE_LEVEL=error mocha test/ --reporter dot",
  "test:scenario": "npm run test:scenario:standalone && npm run test:scenario:mongodb",
  "test:scenario:standalone": "NODE_CONFIG_DIR=$(pwd)/test/config NODE_ENV=standalone npm run test:quiet",
  "test:scenario:mongodb": "NODE_CONFIG_DIR=$(pwd)/test/config NODE_ENV=mongodb npm run test:quiet"
}
```

From the above example, you'll notice that we define a script for `test:quiet` which sets the logging and reporting levels and executes `mocha`.
For our scenario testing we call `npm run test:scenario` which in turn calls individual scenarios. 
Each scenario script sets the correct configuration relevant for that scenario and then run the `test:quiet` script. 
 
This is only a small snippet of the entire `package.json` scripts section, you can see the entire section [here](https://github.com/joola/joola/blob/develop/package.json#L25-L91).

It's not a question if we could have achieved the same using grunt or gulp, of course we could. 
The reason why we chose this approach is due to its simplicity and straightforward manner, fewer dependencies and overall better readability.  

<bv/><br/>
Read more about [how we packaged Joola with Packager.io](packing-joola-with-packager-io.html).