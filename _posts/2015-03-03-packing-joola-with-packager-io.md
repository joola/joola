---
layout: post_no_sidebar
title:  "Packing Joola with Packager.io"
date:   2015-03-03 02:44:32
author: Itay Weinberger
categories: blog
---

We've used [Packager.io](https://packager.io/) to publish Joola as packages for Debian, Ubuntu and CentOS and we wanted to share our reasoning behind offering Joola as a packaged downloadable and our experience with Packager.io. Spoiler alert: it took us less than 10 minutes, worked on the first time and was overall awesome! 

# The problem
Let's start by reviewing why we need to package Joola when we have the powerful [npm](http://npmjs.org) at our disposal. 

Joola is written in Javascript and we use Node.JS to run it, which relies on the npm registry to host different packages and libraries. 
This is the main method for sharing your Node.JS work and we publish our [Joola packages](https://www.npmjs.com/package/joola) as part of our normal development cycle.
 
This works well and developers can install Joola via a simple command:

```bash
$ npm install joola
```

However, while this works well for developers, it's not ideal for users for several reasons:

- Every time your install Joola, it needs to download and install of all the dependencies.
- Some dependencies require compilation, which may fail.
- Dependencies have their own life-cycle, so we might have a situation where a user is using a newer dependency package than one we've tested.
- The installation process can be lengthy if we include the `geo-ip` dictionary for IP lookups.
- npm is designed for libraries, so the user ends up with `./node_modules/joola` folder instead of using "proper" system folders.
- npm installation process does not relate to group, user, directories, permissions etc... creation, so we're quite limited in providing Joola as a service.
- Users can install the package either globally or locally and we want to have uniformed configuration/logging/etc... folders.
 
As part of our publish process we already use `npm shrinkwrap` to try and minimize possible dependency related issues, but it's enough to take a look at our Travis CI log and see that sometime, for no reason, npm will simply blow up.

In order to ensure high user installation success rate we looked into alternatives to the traditional npm process.

# Packager.io to the rescue
[Packager.io](http://packager.io) is an online software-as-a-service offering developers the ability to quickly package their code and offer it to users on different platforms such as Debian, Ubuntu and CentOS.

Packager uses [Heroku buildpacks](https://devcenter.heroku.com/articles/buildpacks), from their documentation:

> The concept of buildpack was introduced by Heroku. It is a simple API to define what needs to be done to generate a self-contained version of an application, ready to be deployed. You can find more about the Buildpack API by following [this link](https://devcenter.heroku.com/articles/buildpack-api).

Packager helps Joola with the problems listed above:

- It packages Node.JS and all of Joola's compiled dependencies into the package.
- Users download a sealed package and there's no change between the code tested as part of our CI and the one deployed in the package.
- Packager.io takes care of the installation folders and other required groups/users/permissions.
- We can customize the build to fit our exact needs.

We were surprised to see how quickly we managed to have a published Ubuntu package, but you can imagine our shock when it actually worked on the first attempt, Joola managed to run on a clean Ubuntu installation without any dependencies or pre-requisites, awesome stuff. 
We imagined the move from a Javascript code executing by Node.JS to a full fledged Ubuntu package as much more difficult. 

# Packaging Joola

We already tested Joola on Heroku and had a `Procfile` for it, it contains a single line:

```bash
web: node joola.js --trace
```

That's all that we really needed to have our package build and publish successfully, but we decided to spend some time and customize our build to our needs.

Below is our `.pkgr.yml` file, it contains the following directives:

- `targets` include all the different distributions we wish to build for.
- `env` is used to flag to Joola that it's a packaged dist.
- `before` is used to cleanup any files we don't want to land on the user machine.
- `after` runs `postinstall` that does some config file linking to our default.yml.

```yaml
targets:
  ubuntu-14.04:
  ubuntu-12.04:
  debian-7:
  centos-6:
env:
  - JOOLA_PKG=true
before:
  - mv ./build/packaging/* .
  - rm -fr build
  - rm -fr test
  - rm -f .*
  - rm -f *.apib
  - rm -f inch.json
  - rm -f *.yml
  - rm -f CONTRIBUTING.md
  - rm -f Vagrantfile
  - rm -f Dockerfile

after_install: ./postinstall.sh
```

Take a look at our [GitHub repository](http://github.com/joola/joola) to see the full files.

The last step was to add a webhook between our repository and Packager.io, this can be easily done using their administration console.
Now every time we merge to our `develop` and `master` branches we have a fresh build executed on our behalf automatically.

Another benefit we found is that we can have both the `develop` and `master` branches trigger Packager.io builds, each ends up hosted in its own repository on Packager.io side, so we can offer developers and users to download stable/latest releases.

# Check it out

Here are the different resources we have as part of our packaging process.

- Joola's packages can be found [here](https://packager.io/gh/joola/joola).
- GitHub repository can be found [here](http://github.com/joola/joola).
- pkgr.yml is [here](https://github.com/joola/joola/blob/develop/.pkgr.yml).
- Procfile is [here](https://github.com/joola/joola/blob/develop/Procfile).
- postinstall is [here](https://github.com/joola/joola/blob/develop/build/packaging/postinstall.sh).


#Packager.io supports open source

Lastly, we would like to thank Packager.io for supporting the open source community by offering this powerful and useful service for free (for open source project only).