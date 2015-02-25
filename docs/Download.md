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

### Running as a service

# Windows & Mac users

While it is possible to install and run Joola on Windows and Mac, this is currently not officially supported.