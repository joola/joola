[**HOME**](Home) > **joola SETUP GUIDE**

Setting up joola is a two step process. Start by installing joola and its stack of pre-requisite components, then you configure the framework according to your needs.
 
Below is a step-by-step guide for installing and visualizing your first event. Each step including a link to a more detailed explanation if it's required. 

1. [Install joola](#step1)
2. [Setup system configuration](#step2)
3. [Send your data](#step3)
4. [Visualize your data!](#step4)

<a name="step1" />
## Step 1: Install joola
joola is developed using [NodeJS][NodeJS], therefore, before starting you'll need to install node as part of your environment.
Moving on, you'll need to install [MongoDB][Mongo], [Redis][Redis] and [RabbitMQ][RabbitMQ], these are used by the caching layer.
We have compiled a more detailed set of instructions that you can find [here](install-joola). This might come in handy if you experience issues during the installation process.

Now that we have the pre-requisits done, let's get to the real deal:
```bash
$ [sudo] mkdir /opt/joola
$ [sudo] chown $USER /opt/joola
$ cd /opt/joola
$ npm install joola [--production]
$ node ./node_modules/joola/bin/joola [--trace]
```

The above example installs joola into a new directory within `/opt`. joola is installed without any special permissions required for out-of-the-box setup.

**Note:** Default configuration assumes `localhost` for your pre-requisits, this means that you have Redis, MongoDB, etc... installed on `localhost` using the default configuration.
If this is not the case, please refer to the [next step](#step-2-setup-system-configuration) of system configuration.

Navigate your browser to `https://localhost:8081`. We have a welcome page made up especially for you and it will help you getting around.

[Learn more about the pre-requisites and the installation process](install-joola)

#### The demo
joola default installation is available at `https://localhost:8081`. We have placed a default welcome page to allow you to play with the system and have an easy settling in.
 This page should be removed of course, before going to production.

The welcome page highlights the different aspects of joola and is a great asset as building blocks to your 
custom joola implementation.

<a name="step2" />
## Step 2: Setup system configuration
By now you have joola installed and running (if you have pre-requisits installed on localhost).
Make sure you take a look at the Welcome Page, it should offer a good place to start.
Configuring the system can be done in several ways, by editing the configuration files, by using the API/SDK, or by using cURL, choose your flavor.

#### Configuration Sections
The configuration file contains several sections needed for the operation of the framework. We've tried to keep it both simple and clear.

##### Interfaces
The interfaces section covers all required settings for joola's public/internal interfaces, for example its webserver.

##### Store
The store section include all configuration needed for the different stores used by the framework, for example Redis.
You'll notice that each store is named, for example the `config` store and it has a redis configuration section.
Other stores can point to the same redis, but we wanted to enable developers to customize their deployments by scale and allow different stores to be used.

##### Authentication
The authentication section contains all relevant configuration for the framework's security and authentication.

##### Dispatch
The dispatch section contains configuration relevant to the internal messaging system of joola ([Dispatch](the-dispatch-subsystem)). You can control timeouts, logic and more.

##### Workspaces
[Workspaces](Workspaces) contain many artificats used by the system, collections, users, roles and much more.

#### Authentication
joola is a secure framework. Accessing the framework can only be done by pre-defined and allowed users and every action 
carried out by the system must have a security context associated with it, i.e. which user has asked for the action.
It is possible to allow `anonymous` access, but this is turned off by default.

The framework ships with a pre-configured user `demo` and the default password of `password`, it uses the APIToken `apitoken-demo`. We recommend changing the
 default password and APIToken after the first login.
 
[Configure your System now!](Configuration)

<a name="step3" />
## Step 3: Send your data
Feeding joola with data is very easy! 

Using simple HTTP POST:
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
  joola.beacon.insert('collection-demo', doc, function(err) { 
    console.log('Document saved');
  });
});
```

That's it, your data is in joola, that's all it takes.

[Setup Your First Event now!](https://github.com/joola/joola/wiki/sdk-api-documentation#joolabeacon)

<a name="step4" />
## Step 4: Visualize your data!
Now comes the cool part, taking the data we gathered and drawing it on a canvas in different shapes and forms.
Let's start with a simple query:
```js
var joola = require('joola.sdk');

joola.query.fetch({
    timeframe:'last_30_minutes',
    interval: 'second',
    dimensions: ['timestamp'],
    metrics: ['visits'],
    collection: 'collection-demo'
    filter: null
  }, function (err, message) {
    console.log(err,message);
  });
```
This will print out a JSON structure full with documents meeting the criteria.

We can also use the above query to draw a timeline visualization of data.

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

[Create your first visualization](your-first-visualization)

## Setup is complete!

You now have joola setup, configured and running!

[Learn more about using joola](using-joola)

[NodeJS]: http://nodejs.org
[Mongo]: http://mongodb.org
[Redis]: http://redis.io
[RabbitMQ]: http://www.rabbitmq.com