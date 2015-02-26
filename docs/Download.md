---

layout: doc
title: Download & install
description: Get up and running with a Joola cluster in under 5 minutes.

---

Joola is written using Javascript and runs using Node.js/io.js, this means that it's compatible with all major operating systems and can be installed directly from the [npm](npm) registry.
That said, Joola uses a variety of libraries for its operation, some require compiling as part of the installation process when using [npm](npm).
This process may fail if supporting libraries are missing or on system we haven't tested in our labs.

**We recommend** you install Joola using one of the package managers fitting your operating system. This will ensure Joola works and saves the need to re-compile libraries as part of the installation process.

# Package managers

Joola uses [packager.io](pkg) to package the framework on all of its dependencies into a single downloadable package.
Packager.io uses [Heroku build packs](heroku) to package and then run Joola, this gives two immediate benefits, firstly Joola can scale vertically using a simple command `joola scale web=n` where `n` is the number of nodes to run.
Also, it resolves you of the need to have Node.js/io.js installed on your machine.

## Ubuntu 14.04 (trusty)

```bash
wget -qO - https://deb.packager.io/key | sudo apt-key add -
echo "deb https://deb.packager.io/gh/joola/joola trusty develop" | sudo tee /etc/apt/sources.list.d/joola.list
sudo apt-get update
sudo apt-get install joola
```

## Ubuntu 12.04 (precise)

```bash
wget -qO - https://deb.packager.io/key | sudo apt-key add -
echo "deb https://deb.packager.io/gh/joola/joola precise develop" | sudo tee /etc/apt/sources.list.d/joola.list
sudo apt-get update
sudo apt-get install joola
```

## Debian 7 (wheezy)

```bash
wget -qO - https://deb.packager.io/key | sudo apt-key add -
echo "deb https://deb.packager.io/gh/joola/joola wheezy develop" | sudo tee /etc/apt/sources.list.d/joola.list
sudo apt-get update
sudo apt-get install joola
```

## CentOS 6

```bash
sudo rpm --import https://rpm.packager.io/key
echo "[joola]
name=Repository for joola/joola application.
baseurl=https://rpm.packager.io/gh/joola/joola/centos6/develop
enabled=1" | sudo tee /etc/yum.repos.d/joola.repo
sudo yum install joola
```

# Download from NPM

Joola is part of the [npm](npm) registry.
All other installation methods end up relying on the Joola's npm package, the main difference with other methods is that you do not need to pre-install node.js, the packaging process takes care of it for you.

That said, working with Joola's npm package offers some benefits and better control over the execution of your node.

### Global installation

Global installation offers the easiest way to get off the ground with your Joola node.

```bash
$ npm install -g joola
$ joola
```

### Local installation

Local installations allow you to run multiple instances of Joola easily on a single machine.

Each installation uses its own set of folders for managing its configuration, state, data stores, etc... so it's ideal for isolating running instances.

```bash
$ npm install joola
$ cd node_modules/joola
$ node joola.js
```

### Running as a service
You can apply the same techniques for running Joola as a service as you would do with any other software, be it init.d, upstart and others.

For us, a natural selection was a daemonizing software written in Javascript and run by node.js, [PM2](pm2). PM2 uses node.js' clustering features to scale your nodes vertically on a single machine.

```bash
$ npm install -g pm2
$ pm2 start joola.js
```

You can control the number of nodes simply by using:

```bash
$ pm2 start joola.js -i max
$ pm2 list
```

# Docker container

Joola can also be used as a Docker container, simply run:

```bash
$ [sudo] docker run -p 8080:8080 joola/joola
```

[Read more about Joola's Docker container](docker hub)

# Vagrant

Joola can also be used in a vagrant virtual box, follow this steps:

```bash
# Clone the source code repository
$ git clone https://github.com/joola/joola
$ cd joola
# Update submodules containing chef recipes
$ git submodule init
$ git submodule update
$ npm install

$ vagrant up
# wait for the box to come online
$ vagrant ssh

# once in the box
$ cd /vagrant
$ node joola.js
```

# Windows & Mac users

While it is possible to install and run Joola on Windows and Mac, this is currently not officially supported.

# Verifying installation

Access the REST API using cURL:

```bash
$ curl http://localhost:8080/system/version?APIToken=apitoken-demo

{ "version": "joola version 0.9.0" }
```

Get started [configuring your Joola](Configuration.html).