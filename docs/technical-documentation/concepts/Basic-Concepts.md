[HOME](Home) > **CONCEPTS**

Before diving deep into the system, it's best to become familiar with some basic concepts used throughout the documentation and by the framework.

### Subsystems
joola's development process is geared toward a community driven project, so we "broke" the framework into several components that work together.
Each subsystem is responsible for a different aspect of the framework and it's not a real cut-off project, rather than a logical/semantic distinction.

[Learn more about subsystems](architecture)

### Workspaces
A workspace is the outer most logical container available. Within workspaces reside collections, users, roles and all other metadata.
We use workspaces in order to separate between metadata and allow secure store and delivery of data based on the workspace configuration.

A common use case for workspaces is to support different environments. Using workspaces we can create for example a separate container for development, QA, staging, demo and production.
 They all share the same joola framework, however each contains its own configuration.

[Learn more about workspaces](workspaces)

### Collections
A collection is a data store where documents (the actual bits of data) are persisted into joola cache. Collections also contain metadata that
describe the stored data, for example, what dimensions and metrics the document contains.
Collection metadate is represented in JSON and includes all required details on the data stored and its attributes. By referencing this metadata, joola interprets
 queries into meaningful insights.

Data is introduced into the collection by [Beacon](the-beacon-subsystem) and later [queried](the-query-subsystem) and visualized.

[Learn more about collections](collections)

### Permissions
Each API endpoint has a permission assigned to it. Only users who are authorized with the required permission can access the endpoint.

The list of permissions is system owned and cannot be changed by the user/operator.

### Roles
A role is a logical entity which holds several permissions and may have a filter associated with it.

[Learn more about roles](roles)

### Users
A user is a simple metadata collection describing a user that will access and use the system.

[Learn more about users](users)

### Dimensions: Describe data
A dimension is an descriptive attribute or characteristic of an object that can be given different values.
For example, a geographic location could have dimensions called Latitude, Longitude, or City Name.
Values for the City Name dimension could be San Francisco, Berlin, or Singapore.
Browser, Device, Date are all examples of dimensions that may appear as part of joola.

[Learn more about dimensions](dimensions)

### Metrics: Measure data
Metrics are individual elements of a dimension that can be measured as a sum or a ratio.
For example, the dimension City can be associated with a metric like Population, which would have a sum value of all the residents of the specific city.
Visits, Page per Visit, and Average Visit Duration are examples of metrics that may be part of joola.

[Learn more about metrics](metrics)