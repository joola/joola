[**HOME**](Home) > **JOOLA.IO SETUP GUIDE**

Setting up joola.io is a five step process:

1. [Install joola.io](#step1)
2. [Setup system configuration](#step2)
3. [Configure data stores](#step3)
4. [Define dimensions/metrics and other content](#step4)
5. [Visualize your data!](#step5)

<a name="step1" />
## Step 1: Install joola.io

joola.io is developed using [NodeJS][NodeJS], therefore, before starting you'll need to install node as part of your environment.
Moving on, you'll need to install [MongoDB][Mongo] and [Redis][Redis], these are used by the caching layer.

Now that we have the pre-requisits done, let's get to the real deal:
```bash
$ [sudo] npm install joola.io -g
$ joola.io --demo
```

This will install `joola.io` as a global package on the machine. While this is a good solution for most developers, some wish to have side-by-side installations of joola.io running on the same box.
So, another option is to install a local copy of joola.io.
```bash
$ [sudo] mkdir /opt/joola.io
$ [sudo] chown $USER /opt/joola.io
$ cd /opt/joola.io
$ npm install joola.io
$ ./node_modules/joola/bin/joola.io
```

The above example installs joola.io into a new directory within `/opt`. joola.io is installed without any special permissions required for out-of-the-box setup.

**Note about ports:** installing joola.io without root permissions will not allow it to open ports lower than 1024 for security reasons. The default port is set to 8080 so this should not be an issue. However, should you wish to use port 80 or other lower than 1024, please run joola.io with root privileges.

### The demo
Running joola.io for the first time with default configuration or by specifying the `--demo` switch loads joola.io with our demo. The demo tries to highlight the different
aspects of joola.io and is a great asset as building blocks to your custom joola.io implementation.

[Learn more about the demo and how to use it](The-Demo)

### Where to start?
Navigate your browser to `http://localhost:8080`. We have a welcome page made up especially for you and it will help you getting around.

<a name="step2" />
## Step 2: Setup system configuration
By now you have joola.io installed and running. Make sure you take a look at the Demo Welcome Page, it should offer a good place to start.
Configuring the system can be done in two ways, directly editing the JSON configuration file, or by using the management interface, choose your flavor.

#### Interfaces
//TODO: TBC

#### Stores
//TODO: TBC

#### Authentication
//TODO: TBC

[Setup your System now!](setting-up-the-system)

<a name="step3" />
## Step 3: Define your collections
joola.io is all about providing insight from your data, but in order to do so it needs to know a few things about your data, you need to describe it for joola.io.
During this process we'll define collections, dimensions and metrics. Having these defintions allows us to categorize, correlate and map your data into meaningful insight.

#### Collections
Collections are used to store *documents*. Collections describe the document, its dimensions, 
metrics and other descriptive information and guidelines on how to process the documents into meaningful insight. 

[Setup Collections now!](setting-up-collections)

<a name="step4" />
## Step 4: Send your data
Feeding joola.io with data is very easy! We include the Client SDK as a library in a NodeJS project or even a simple webpage, then we instruct it to save the data.
```js
	var joolaio = require('joola.io');
	joolaio.dispatch.beacon.insert('collection', {
		timestamp: new Date(),
		x: event.X,
		y: event.Y
	});
```
That's it, your data is in joola.io, that's all it takes.

<a name="step5" />
## Step 5: Visualize your data!
Now comes the cool part, taking the data we gathered and drawing it on a canvas in different shapes and forms.
Let's start with a simple query:
```js
	var joolaio = require('joola.io');

	joolaio.dispatch.query.fetch({
			timeframe:'last_30_minutes',
			interval: 'second',
			realtime: true,
			dimensions: ['timestamp'],
			metrics: ['x', 'y'],
			filter: null
		}, function (err, message) {
			console.log(err,message);
		});
```
This will print out a JSON structure full with documents meeting the criteria.

## Setup is complete!

You now have joola.io setup, configured and running!

[NodeJS]: http://nodejs.org
[Mongo]: http://mongodb.org
[Redis]: http://redis.io