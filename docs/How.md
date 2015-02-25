---

layout: doc
title: How does Joola work?
description: Read about Joola development and how you can help.

---

Before diving deep into the system, it's best to become familiar with some basic concepts used throughout the documentation and by the framework.

Joola is a distributed data framework focused at managing analytical processes and data visualization. This means that Joola can be used for a multitude of use cases, ranging from pure visual analytics systems to advanced ad serving.

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