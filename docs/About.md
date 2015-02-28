---

layout: doc
title: About the Joola project
description: Read about Joola development and how you can help.

---

Joola is a distributed data processing, analytics and visualization framework.
The framework is designed as an end-to-end solution for data analytics that lets you connect your databases using JSON based mapping of dimensions and metrics.
It exposes a RESTful API for querying the data, displaying and manipulating it.
The Client SDK communicates with the engine to display, visualize and provide insight into the data. Developers can extend the framework in many ways, add data connectors, authentication plugins, visualizations and more.

# Architecture

Joola's architecture is designed for scale and resilience, clusters can be as small as all-in-one nodes you run on your workstation to a full fledged distributed cluster on-premise on hosted on the cloud.
This scalability is achieved using Joola's agnostic approach to its configuration, discovery and data store providers.

## Central configuration
Joola uses a node based architecture, meaning all nodes must share the same configuration and respond together to configuration changes.
When run as a standalone node, Joola can use the local file system to manage configuration, however when multiple nodes on distributed machines are needed, they all need to share a single source of configuration.

For this purpose, Joola uses a central configuration store which can be either [Redis](redis) or [Zookeeper](zookeeper) (at the moment) and we're working on adding [Consul](consul) and [etcd](etcd), feel free to [give us a hand](contributing).

When Joola starts tries and [locate a configuration file](see below for discovery logic) and load it into the central store if it hasn't been initialized yet.
 Additional nodes joining the cluster must have at least a single setting of the central configuration store to use in order to operate correctly,
 they'll connect to the central configuration store, load the most current values and respond to any future change.

[Read more about configuration](Configuration.html)

## Node discovery process
As more nodes join the cluster they connect to the central configuration store and learn about other nodes in the cluster.

The implementation of this discovery process is different based on the specific provider, however they all provide a standard assurance that nodes register and de-register in an orderly manner and
that requests passed back-and-forth between nodes arrive safely to their destination.

As a side note, Joola does not elect a leader and all nodes participate as equals.

## Data stores
While Joola comes packed with a simple in-memory (file-system backed) based database, when it comes to big-data that's hardly enough and a proper data store is required.

Joola is designed in an agnostic manner to the data store provider and currently supports [ElasticSearch](elasticsearch) or [MongoDB](mongodb) and we're working on adding more, feel free to [give us a hand](a hand).

[Read more about data stores](Data.html)

## Message Delivery (MQ)
Joola uses a Message Queue to ensure the framework's accuracy and resilience.

Each cluster node subscribe to a central MQ via [STOMP](stomp) protocol and push/read events as they arrive to the cluster.
Having MQ helps Joola ensure that all events that pushed into the cluster end up being analyzed and processed according to a specific logic.

Another benefit of using MQ is the ability to scale up and reduce the cluster's load by adding more nodes that subscribe to handle incoming events/requests.

[Read more about message queues](Data.html)

## Joola at scale diagram
Here's a diagram showing how the different players work together at a large scale deployment.

<img src="http://www.websequencediagrams.com/cgi-bin/cdraw?lz=RGV2ZWxvcGVyLT5Kb29sYTogSW5zdGFsbCBhbmQgY29uZmlndXJlCgAYBS0-QwAMBTogAAIGdXJlIGluc3RhbmNlCmxvb3AgQnVzaW5lc3Mgc2VuZHMgZGF0YSB0byAAVgUKAFoSRGF0YSBwdXNoIChKU09OIG92ZXIgUkVTVCkAaQhNUTogTmV3AEQGcHVzaApNUQCBIglFeGVjdXRlADwGYnkgZnJlZSBub2QAgSUKYWNoZTogU3RvAIElBSBjYWNoZSBsYXllcgoAFwUAGglSZWR1Y2UqCmVuZACBOw91c2VycyB2aWV3IGFuYWx5dGljcwCBMxhxdWVyeSB2aWEgU0RLAIEWPgBFBgCBSA0AgSsHAIMhB1EAZwVyZXNwb25zAIMYCQCDPgdQcmVwYXJlAA4RAINmCQAwEACCewYpAIMYDAAhC1JlbmRlciBpbgCCCQUgYnJvd3NlcgplbmQ&s=qsd">


# Terminology

Before diving deep into the system, it's best to become familiar with some basic concepts used throughout the documentation and by the framework.

Joola is a distributed data framework focused at managing analytical processes and data visualization. This means that Joola can be used for a multitude of use cases, ranging from pure visual analytics systems to advanced ad serving.


## Workspaces
A workspace is the outer most logical container available. Within workspaces reside [collections](collections), [users](users), [roles](roles) and all other metadata.
We use workspaces in order to separate between metadata and allow secure store and delivery of data based on the workspace configuration.

A common use case for workspaces is to support different environments. Using workspaces we can create for example a separate container for development, QA, staging, demo and production.
 They all share the same joola framework, however each contains its own configuration.

```js
[
  {
    "key": "_test",
    "description": "Workspace for internal joola tests",
    "name": "joola Framework Tests"
  },
  {
    "key": "_stats",
    "description": "Stores internal statistics of joola",
    "name": "Internal Stats"
  },
  {
    "key": "demo",
    "description": "A starter/playground workpsace",
    "name": "Demo Workspace"
  }
]
```

[API documentation on managing Workspaces](https://github.com/joola/joola/wiki/api-documentation#group-workspaces)

## Collections
A collection is a data store where documents (the actual bits of data) are persisted into joola cache. Collections also contain metadata that
describe the stored data, for example, what dimensions and metrics the document contains.
Collection metadate is represented in JSON and includes all required details on the data stored and its attributes. By referencing this metadata, joola interprets
 queries into meaningful insights.

Data is introduced into the collection by [Beacon](the-beacon-subsystem) and later [queried](the-query-subsystem) and visualized.

[Learn more about collections](collections)

## Permissions
Each API endpoint has a permission assigned to it. Only users who are authorized with the required permission can access the endpoint.

The list of permissions is system owned and cannot be changed by the user/operator.

## Roles
A role is a logical entity which holds several permissions and may have a filter associated with it.

[Learn more about roles](roles)

## Users
A user is a simple metadata collection describing a user that will access and use the system.

[Learn more about users](users)

## Dimensions: Describe data
A dimension is an descriptive attribute or characteristic of an object that can be given different values.
For example, a geographic location could have dimensions called Latitude, Longitude, or City Name.
Values for the City Name dimension could be San Francisco, Berlin, or Singapore.
Browser, Device, Date are all examples of dimensions that may appear as part of joola.

[Learn more about dimensions](dimensions)

## Metrics: Measure data
Metrics are individual elements of a dimension that can be measured as a sum or a ratio.
For example, the dimension City can be associated with a metric like Population, which would have a sum value of all the residents of the specific city.
Visits, Page per Visit, and Average Visit Duration are examples of metrics that may be part of joola.

[Learn more about metrics](metrics)

# The development process

Our goal is to create brilliant software and we setup an end-to-end software development life-cycle (SDLC) aiming at that. Therefore, we have created the following manual that describes
the life-cycle we have here at joo.la labs. This is an internal process and describe steps that are relevant not only to the Joola framework development, but also to commercial implementations.
On top of the process described we have our community contributions that act as a key part of the software development path. 
We believe that sharing information about our internal processes with the community will not only make our process better, but also allow the community to benefit from it.

## Assess Needs
The first step in the process is to assess the needs of this iteration. What tasks, defects, milestones, etc... we have to cover during the iteration. 
This process is key to the success of the iteration, getting a full understanding of a requirement ensures a proper execution during the iteration with a very clear set of expectations. 
The format of this step is an *Assessment Meeting* which includes all stake-holders relevant to the iteration. 
This step can take a few hours/days and the group decides on what is included in the iteration and what's not.

## Design Specifications
Once we have the needs clarified we can design the specifications for each of the new features, bug fix, etc... Specifications must be detailed and try to evaluate the entire scope of the task. 
When designing the specifications we must take into account that a task estimated to take longer than the iteration cannot be accepted, it will need to be broken down. 
Once we have the specifications for each task, the matching estimations and all required work, we can then approve the final list of issues to be covered in the iteration.

## Design/Develop/Test
The actual code work begins, we design, develop and [test](code-testing) our work on a regular basis. 
Git development process follows [Vincent Driessen's](http://twitter.com/nvie) suggested [GitFlow](http://nvie.com/posts/a-successful-git-branching-model/) and is managed under GitHub. 
Code work should be carried out on branches and merged into the *develop* branch via managed pull-requests. When appropriate, a [release process](software-release-process) starts which merges *develop* into *master* via a *release branch*.  

Code work must adhere to the [Coding Guidelines](coding-style-guidelines).

## Implement Systems
Once the release is ready, according to the Release Management protocol, we can move on to implementation. 
We have multiple environments for ourselves and managed customers. The [Deployment](software-deployment) process must be followed by the Release Manager.

## Support Operations
Following the release process we can move on to monitor and support. The goal of this phase is to ensure the released artifacts are performing well. 
Please refer to the [Monitoring and Alerts](monitoring-and-alerts) section for instructions on how this is managed.

## Evaluate Performance
Another key part of the iteration is the evaluation phase. During this phase we will contact customers who received custom features and confirm their satisfaction and acceptance. 
For our larger customers base (SaaS) we will send targeted surveys and use the Site's Feedback option to collect impressions.
Another part of this evaluation will be measuring the operational impact of the release, i.e. does it increase or decrease our operating costs.

### And Again...
This concludes a single iteration, this is repeated every time. The more we do it, the better we get at it.


# Contributing

Joola is open source software - we welcome contributors! Some things you might like to help out with:

* Documentation
* New features
* Bugfixes
* Security vulnerabilities

## Join the conversation

Have an idea for Joola? Found a bug? We encourage you to start a conversation on the [Joola Google Group] [joola-user] or to file a [new issue on GitHub] [new-issue] before writing code.
Announcing what you're working on (or even just your need or pain points) starts a collaborative process to identify general solutions and helps us all avoid duplicating effort.

Let's build Joola and grow our community, together.

## Contributor License Agreement

As the project sponsor, Joola Smart Solutions Ltd. would like to ensure the long-term viability of Joola and its community. 
The Contributor License Agreement helps ensure everyone can enjoy Joola with confidence that Joola is here to stay.

Specifically, our Contributor License Agreements (CLAs) grant the contributor and Joola Smart Solutions Ltd. joint copyright interest in contributed code. 
Further, it provides assurance from the contributor that contributions are original work that does not violate any third-party license agreement. 
The agreement between contributors and project is explicit, so Joola users can be confident in the legal status of the source code and their right to use it.

For all contributions to Joola (be they software, bug fixes, configuration changes, documentation, or any other materials), we ask that contributors complete and sign a Contributor License Agreement.
We have two different Contributor License Agreements (CLAs), depending on whether you are contributing in a personal or professional capacity. Both are based on the Apache Software Foundation's own CLAs, with modifications:

* [Individual Contributor License Agreement v1.0] [indiv-cla]
* [Software Grant and Corporate Contributor License Agreement v1.0] [corp-cla]

Please complete and sign the most appropriate CLA for you. For more information, see our dedicated page on our [Contributor License Agreements](About.html#Contributor-License-Agreement).

## Contributing to development
Third-party patches are essential for keeping Joola great and we want to
keep it as easy as possible to contribute changes that get things working in
your environment. There are a few guidelines that we need contributors to
follow so that we can have a chance of keeping on top of things.

### Getting Started

- Make sure you have a [GitHub account](https://github.com/signup/free).
- Submit a ticket for your issue (http://github.com/joola/joola/issues), assuming one does not already exist.
  * Clearly describe the issue including steps to reproduce when it is a bug.
  * Make sure you select the relating components to the issue.
  * Make sure you fill in the earliest version that you know has the issue.
- Fork the repository on GitHub

### Making Changes

* Create a ticket branch (name your branch #issuenumber, according to the ticket you raised) from where you want to base your work.
  * This is usually the `develop` branch.
  * Only target release branches if you are certain your fix must be on that
    branch.
  * To quickly create a ticket branch based on master; `git branch
    feature/#issuenumber develop` then checkout the new branch with `git
    checkout feature/#issuenumber`. Please avoid working directly on the
    `master` or `develop` branches.
* Make commits of logical units.
* Check for unnecessary whitespace with `git diff --check` before committing.
* Make sure your commit messages are in the proper format `#issuenumber message`.

````
#123 Make the example in CONTRIBUTING imperative and concrete

Without this patch applied the example commit message in the CONTRIBUTING
document is not a concrete example.  This is a problem because the
contributor is left to imagine what the commit message should look like
based on a description rather than an example.  This patch fixes the
problem by making the example concrete and imperative.

The first line is a real life imperative statement with a ticket number
from our issue tracker.  The body describes the behavior without the patch,
why this is a problem, and how the patch fixes the problem when applied.
````

* Make sure you have added the necessary tests for your changes.
* Make sure you lint your code (run: ```npm run lint```).
* Run _all_ the tests to assure nothing else was accidentally broken (run: ```npm run test:scenario```)..
* Make sure your tests maintain the current test coverage level (run: ```npm run test:scenario:coverage```).

### Documentation

Documentation is managed under the repo's wiki.
For changes of a trivial nature to comments and documentation, it is not
always necessary to update the wiki. For contributions affecting documentation,
please contact project admins to ensure you have been granted with an editor role.

### Submitting Changes

* Sign the [Contributor License Agreement](About.html#Contributor-License-Agreement).
* Push your changes to a ticket branch in your fork of the repository.
* Submit a pull request to the repository in the Joola organization.
* Update your ticket to mark that you have submitted code and are ready for it to be reviewed.
  * Include a link to the pull request in the ticket

## Contributing to documentation

We welcome contributors to the Joola documentation with open arms - just as we welcome contributors to the Joola codebase!

Our main store of documentation is the project's gh-pages site.

### Contributing to the documentation

To make edits to the documentation, fork the repo (git://github.com/joola/joola.git), checkout the `gh-pages` branch (run: `git checkout -b gh-pages`) make edits and then submit a pull request.
The documentation site is powered by [Jekyll](http://jekyllrb.com/) coupled with [redcarpet](https://github.com/vmg/redcarpet) markdown.

All the documentation is stored in Markdown format. Good tools for editing markdown include [Markdownpad] (http://markdownpad.com/) on Windows, or [Mou] (http://mouapp.com/) for Mac.
We also like [Sublime Text] (http://www.sublimetext.com/).

### Contributing to Code Documentation

To make edits to the code documentation (jsdoc), for the code repo (git://github.com/joola/joola.git), 
make edits to the jsdoc comments in the code files located under `lib` and then submit a pull request.
  
We are using a custom-tailored version of [jsdox](http://github.com/itayw/jsdox) for building our jsdoc documentation. 

# Responsible disclosure

We want to keep Joola safe and secure for everyone. 
If you've discovered a security vulnerability in Joola, we appreciate your help in disclosing it to us in a responsible manner.

### Bounty Program

Joola provides a "bug bounty program" to better engage with security researchers. 
The idea is simple: hackers and security researchers (like you) find and report vulnerabilities through our responsible disclosure process. 
Then, to recognize the significant effort that these researchers often put forth when hunting down bugs, we reward them recognition in our [hall of fame](https://hackerone.com/joola-io/thanks).

Check out the [joola Bug Program](https://hackerone.com/joola-io) on hacker1 for full details, and happy hunting!

# Copyright and license

Joola is copyright 2012-2015 Joola Smart Solutions Ltd.

### License

The Joola project is licensed under the [GPL License, Version 3.0] [license] (the "License");
you may not use this software except in compliance with the License.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

### Third-party, git-submoduled contributions

The loosely-coupled architecture of Joola makes it easy to swap out individual sub-system implementations for first- or third-party alternatives.
Please note that third-party, git-submoduled contributions to Joola remain the copyright of their respective authors.

Third-party, git-submoduled contributions may be released under a different license to [GPL License, Version 3.0] [license];
please consult the licensing information in their original GitHub repositories for confirmation.


# Talk to us

We want to make it super-easy for Joola users and contributors to talk to us and connect with each other, to share ideas,
solve problems and help make Joola awesome.
Here are the main channels we're running currently, we'd love to hear from you on one of them:

- [![Gitter chat](https://badges.gitter.im/joola/joola.png)](https://gitter.im/joola/joola)
- [@getjoola] [joola-twitter]



[license]: https://github.com/joola/joola/blob/master/LICENSE.md

[indiv-cla]: https://docs.google.com/forms/d/19gSbpRlV0HqdmkMmUCbZ18uDbAlSvvdGegtbNwqh0J0/viewform
[corp-cla]: https://docs.google.com/forms/d/1pN2CWuN18yKCOwtv0hKY54LOJb3b2ua9qTlWH5MDrnM/viewform

[joola-user]: https://groups.google.com/forum/#!forum/joola-user
[new-issue]: https://github.com/joola/joola/issues/new

[joola-twitter]: https://twitter.com/getjoola
[new-issue]: https://github.com/joola/joola/issues/new
[issues]: https://github.com/joola/joola/issues?direction=desc&sort=created&state=open
[community-email]: mailto:community@joo.la
[freenode-webchat]: http://webchat.freenode.net/