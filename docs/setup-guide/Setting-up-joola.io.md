[**HOME**](Home) > **JOOLA.IO SETUP GUIDE**

Setting up joola.io is a five step process:

1. [Install joola.io](#step1)
2. [Setup system configuration](#step2)
3. [Define your collections](#step3)
4. [Send your data](#step4)
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

This will install joola.io as a global package on the machine. While this is a good solution for most developers, some wish to have side-by-side installations of joola.io running on the same box.
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

[Learn more about the pre-requisites and the installation process](install-joola.io)

#### The demo
Running joola.io for the first time with default configuration or by specifying the `--demo` switch loads joola.io 
with our demo. The demo highlights the different aspects of joola.io and is a great asset as building blocks to your 
custom joola.io implementation.

Navigate your browser to `http://localhost:8080`. We have a welcome page made up especially for you and it will help you getting around.

[Learn more about the demo and how to use it](The-Demo)

<a name="step2" />
## Step 2: Setup system configuration
By now you have joola.io installed and running. Make sure you take a look at the Demo Welcome Page, it should offer a good place to start.
Configuring the system can be done in two ways, directly editing the JSON configuration file, or by using the management interface, choose your flavor.

#### Interfaces
joola.io exposes several public interfaces which may be accessible by the developer and/or users.

The **Web Server** interface provides the system's UI and API endpoints for managing the system on all of 
its aspects.  
The **Beacon** interface exposes a set of API endpoints for storing and managing data within joola.io.    
Lastly, the **REPL** interface provides a `read–eval–print loop` that allows developers to debug joola.io in realtime
 in case needed. 

#### Stores
joola.io needs uses different stores for its operation, these range from a redis store for configuration to a mongodb
 database used by the caching layer.

As you can see from the default configuration shown below, all settings assume `localhost` is running mongodb and 
redis.

```js
  {
    "config": {"redis": {"host": "localhost", "port": 6379, "db": 0, "pass": null }},
    "dispatch": {"redis": {"host": "localhost", "port": 6379, "db": 1, "pass": null}},
    "socketio": {"redis": {"host": "localhost", "port": 6379, "db": 2, "pass": null}},
    "runtime": {"redis": {"host": "localhost", "port": 6379, "db": 3, "pass": null}},
    "stats": {"mongo": {"host": "localhost", "port": 27017, "user": null, "password": null, "db": "stats"}},
    "logger": {
      "mongo": {"level": "trace", "host": "localhost", "port": 27017, "user": null, "password": null, "db": "logger"},
      "file": {"level": "trace", "path": "/tmp/joola.io/"}
    },
    "beacon": {"mongo": {"host": "localhost", "port": 27017, "user": null, "password": null, "db": "beacon"}},
    "cache": {"mongo": {"host": "localhost", "port": 27017, "user": null, "password": null, "db": "cache"}}
  }
```

#### Authentication
joola.io is a secure framework. Accessing the framework can only be done by pre-defined and allowed users and every action 
carried out by the system must have a security context associated with it, i.e. which user has asked for the action.
It is possible to allow `anonymous` access, but this is turned off by default.

The framework ships with a pre-configured user `admin` and the default password of `admin`. We recommend changing the
 default password after the first login. 
 
[Setup your System now!](setting-up-the-system)

<a name="step3" />
## Step 3: Define your collections
joola.io is all about providing insight based on your data, but in order to do so it needs to know a few things about 
your data, you need to describe it for joola.io.
During this process we'll define collections, dimensions and metrics. Having these defintions allows us to categorize, correlate and map your data into meaningful insight.

**Collections** are used to store *documents*. Collections describe the document, its dimensions, 
metrics and other descriptive information and guidelines on how to process the documents into meaningful insight. 

Here's a simple example of creating a new collection:
```js
//Definitions for new collections
var newCollection = {
  id: 'collection',
  name: 'My First Collection',
  description: 'This is my attempt with creating a collection',
  type: 'data', dimensions:{"timestamp":{"id":"timestamp","type":"timestamp","mapto":"timestamp"}}, metrics:{"test":{"id":"test","name":"test","type":"int","aggregation":"sum"}}
}

//The actual instruction to add the new collection
joolaio.dispatch.collections.add(newCollection, function(err, collection) { 
  if (err) //if error, report it
    throw err;
  
  //collection created succesfully, print it
  console.log('New collection added', collection);
});
```

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

[Setup Your First Event now!](your-first-event)

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

We can also use the above query to draw a timeline visualization of data.

```js
	var joolaio = require('joola.io');
  var query = {
                timeframe:'last_30_minutes',
                interval: 'second',
                realtime: true,
                dimensions: ['timestamp'],
                metrics: ['x', 'y'],
                filter: null
              };
              
	$('<div></div>').Timeline({query: query}).appendTo('body');
		});
```


[Create your first visualization](your-first-visualization)

## Setup is complete!

You now have joola.io setup, configured and running!

[Learn more about using joola.io](using-joola.io)

[NodeJS]: http://nodejs.org
[Mongo]: http://mongodb.org
[Redis]: http://redis.io