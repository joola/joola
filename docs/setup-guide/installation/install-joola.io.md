[HOME](Home) > [SETUP GUIDE](setting-up-joola.io) > **STEP 1: INSTALL JOOLA.IO**

This is the complete installation guide for joola.io.

## Step 1: Pre-requisites
Before installing joola.io we need to complete the installation of a few pre-requisites, 
these are required for the normal operation of joola.io.

#### NodeJS
Node.js is a platform built on Chrome's JavaScript runtime for easily building fast, 
scalable network applications.  Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and 
efficient, perfect for data-intensive real-time applications that run across distributed devices.

[Learn more about installing NodeJS](http://nodejs.org/download/)

#### Redis
Redis is an open source, BSD licensed, advanced key-value store. It is often referred to as a data structure server since keys can contain strings, hashes, lists, sets and sorted sets.

joola.io uses redis to store many different key-value pairs needed for its operation. We've chosen redis because of 
its performance, scalability, redundancy and other capabilities.

>
**Note:** joola.io is designed to support more than a single key-value store type for its operation. In the future, 
we will offer support for additional store types.

[Learn more about installing Redis](http://redis.io/download)

#### MongoDB
MongoDB (from "humongous") is an open-source document database, and the leading NoSQL database. Written in C++, 
MongoDB features: Document-Oriented storage, full index support, replication & high availability, auto sharding, 
querying, fast in-place updates, map/reduce and more.

joola.io uses mongodb to store interim cache records and it is the basis of joola.io high performance.

>
**Note:** joola.io is designed to support more than a single store type for its cache layer. In the future, 
we will offer support for additional store types.

[Learn more about installing MongoDB](http://www.mongodb.org/downloads)

#### RabbitMQ
RabbitMQ is a messaging broker - an intermediary for messaging. It gives your applications a common platform to send and receive messages, and your messages a safe place to live until received.
joola.io uses RabbitMQ to manage its message dispatch and routing and it is the basis of joola.io high performance.

>
**Note:** joola.io is designed to support more than a single store type for its messaging layer. In the future, 
we will offer support for additional store types.

[Learn more about installing RabbitMQ](http://www.rabbitmq.org//download.html)

## Step 2: Install joola.io
joola.io is an [npm](http://npmjs.org) package and installing it is as simple as running:
```bash
$ mkdir /opt/joola.io
$ cd /opt/joola.io
$ npm install joola.io
```

This will download and install joola.io on your computer alongside all required dependencies.
 
## Step 3: Tests (optional)
In order to make sure the installation process completed successfully and that joola.io is installed properly on your
 system, you can run its tests.
 
```bash
$ cd /opt/joola.io
$ npm test
```

## Step 4: First run
Now that you have joola.io installed, you can run it by simply doing:

```bash
$ cd /opt/joola.io
$ npm start
```

Once the system is online, navigate your browser to `http://localhost:8080`.

If you encounter any failing tests or joola.io reports and issue, please refer to the [[Troubleshooting] guide.