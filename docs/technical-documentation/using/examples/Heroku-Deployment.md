[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [EXAMPLES](examples) > **HEROKU DEPLOYMENT**

This walkthrough will show how you can install joola on an [Heroku][heroku] instance.

### Before you begin
- Make sure you have an [Heroku account][heroku].

### Step 1: Clone joola repository into a fresh dir
```bash
$ mkdir joola-io-example
$ cd joola-io-example
$ git clone http://github.com/joola/joola .
```

### Step 2: Create your heroku app
In this example, we'll be creating an app called `joola-example`.
```bash
$ heroku apps:create joola-io-example
# Git remote heroku added
```

### Step 3: Add required add-ons
joola requires a few dependencies in order to operate correctly.

##### Redis
There are a few Redis add-on providers, but make sure you choose those running Redis 2.6 or above. Our preferred provider is `Redis Cloud`.

```bash
$ heroku addons:add rediscloud
````

After you've installed the Redis Cloud add-on, you'll need to set joola relevant environment variables.
```bash
$ heroku config:get REDISCLOUD_URL
# redis://rediscloud:******************@pub-redis-*******.us-east-*-*.*.ec2.garantiadata.com:******

$ heroku config:set joola_CONFIG_STORE_CONFIG_REDIS_DSN=<REDISCLOUD_URL>
$ heroku config:set joola_CONFIG_STORE_DISPATCH_REDIS_DSN=<REDISCLOUD_URL>
```

To locate your Cloud Redis DSN, simply navigate to your dashboard and under the application we created (joola-io-example) goto settings.
Under settings you'll need to Reveal Environment Variables and you'll notice the DSN under `REDISCLOUD_URL`.

##### MongoDB
It's recommended to use MongoDB 2.6 or above. Our preferred add-on provider is `MongoHQ`.

```bash
$ heroku addons:add mongohq
```

After you've installed the Redis Cloud add-on, you'll need to set joola relevant environment variables.
```bash
$ heroku config:get MONGOHQ_URL
# mongodb://heroku:*************************************@oceanic.mongohq.com:*********/app**********

$ heroku config:set joola_CONFIG_STORE_CACHE_MONGO_DSN=<MONGOHQ_URL>
```

##### MQ (STOMP)
joola uses STOMP protocol for communicate with a message queue. Our preferred Heroku add-on provider is `CloudAMQP`.

```bash
$ heroku addons:add cloudamqp
```

After you've installed the CloudAMQP add-on, you'll need to set joola relevant environment variables.
```bash
$ heroku config:get CLOUDAMQP_URL
# amqp://********:****************@turtle.rmq.cloudamqp.com/**************

# You need to change the connection string to be stomp://
# stomp://********:****************@turtle.rmq.cloudamqp.com/**************

$ heroku config:set joola_CONFIG_STORE_DISPATCH_STOMP_DSN=<CLOUDAMQP_URL>
```

### Step 4: Publish your app
Now we will push our repository to Heroku and it will npm install all required packages and run the website.

```bash
# publish from master
$ git push heroku develop:master

# publish from develop
$ git push heroku develop:master

# publish from feature branch (#406)
$ git push heroku feature/#406:master
```

### Step 5: Check your website
Navigate to your Heroku app, for example: [[http://http://joola-io-example.herokuapp.com/]].

You can use `$ heroku logs [--tail]` to review the console logs and check for any issues.

[heroku]: heroku.com