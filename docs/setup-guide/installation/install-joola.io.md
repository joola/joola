[HOME](Home) > [SETUP GUIDE](setting-up-joola) > **STEP 1: INSTALL joola**

This is the complete installation guide for joola.

## Pre-requisites
Before installing joola we need to complete the installation of a few pre-requisites, 
these are required for the normal operation of joola.

#### NodeJS
Node.js is a platform built on Chrome's JavaScript runtime for easily building fast, 
scalable network applications.  Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and 
efficient, perfect for data-intensive real-time applications that run across distributed devices.

###### Additional requirements for NodeJS
- [Git](http://git-scm.com) version **1.8** or above `$ yum install git`
- C++ compiler (like gcc) to be available on the machine `$ yum install gcc make`

[Learn more about installing NodeJS](http://nodejs.org/download/)

#### Redis
Redis is an open source, BSD licensed, advanced key-value store. It is often referred to as a data structure server since keys can contain strings, hashes, lists, sets and sorted sets.

joola uses redis to store many different key-value pairs needed for its operation. We've chosen redis because of 
its performance, scalability, redundancy and other capabilities.

joola uses `node_redis` as the package responsible for Redis communication. `node_redis` supports the usage of `hiredis` which is a C++ library to support faster operations and communications between NodeJS packages and the Redis server.

>
**Note:** joola is designed to support more than a single key-value store type for its operation. In the future, 
we will offer support for additional store types.

[Learn more about installing Redis](http://redis.io/download)

#### MongoDB
MongoDB (from "humongous") is an open-source document database, and the leading NoSQL database. Written in C++, 
MongoDB features: Document-Oriented storage, full index support, replication & high availability, auto sharding, 
querying, fast in-place updates, map/reduce and more.

joola uses mongodb to store interim cache records and it is the basis of joola high performance.

>
**Note:** joola is designed to support more than a single store type for its cache layer. In the future, 
we will offer support for additional store types.

[Learn more about installing MongoDB](http://www.mongodb.org/downloads)

#### RabbitMQ
RabbitMQ is a messaging broker - an intermediary for messaging. It gives your applications a common platform to send and receive messages, and your messages a safe place to live until received.
joola uses RabbitMQ to manage its message dispatch and routing and it is the basis of joola high performance.

You will need to activate the STOMP protocol and make it available for joola:
```bash
$ [sudo] rabbitmq-plugins enable rabbitmq_stomp
$ [sudo] service rabbitmq-server restart
$ [sudo] rabbitmqctl status
$ [sudo] rabbitmq-plugins list
```

>
**Note:** joola is designed to support more than a single store type for its messaging layer. In the future, 
we will offer support for additional store types.

[Learn more about installing RabbitMQ](http://www.rabbitmq.org/download.html)

## Install joola
joola is an [npm](http://npmjs.org) package and installing it is as simple as running:
```bash
$ mkdir /opt/joola
$ cd /opt/joola
$ npm install joola
```

This will download and install joola on your computer alongside all required dependencies.
 
## Tests (optional)
In order to make sure the installation process completed successfully and that joola is installed properly on your
 system, you can run its tests.
 
```bash
$ cd /opt/joola
$ npm test
```

## First run
Now that you have joola installed, you can run it by simply doing:

```bash
$ cd /opt/joola
$ node ./node_modules/joola/joola.js
```

Once the system is online, navigate your browser to `https://localhost:8081`.

If you encounter any failing tests or joola reports and issue, please refer to the [[Troubleshooting] guide.