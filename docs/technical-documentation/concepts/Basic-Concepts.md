[HOME](Home) > **CONCEPTS**

Before diving deep into the system, it's best to become familiar with some basic concepts used throughout the documentation and by the framework.

### Subsystems
joola.io's development process is geared toward a community driven project, so we "broke" the framework into several components that work together.
Each subsystem is responsible for a different aspect of the framework and it's not a real cut-off project, rather than a logical/semantic distinction.

[Learn more about subsystems](architecture)

### Collections
A collection is a data store where documents (the actual bits of data) are persisted into joola.io cache. Collections also contain metadata that
describe the stored data, for example, what dimensions and metrics the document contains.
Collection metadate is represented in JSON and includes all required details on the data stored and its attributes. By referencing this metadata, joola.io interprets
 queries into meaningful insights.

Data is introduced into the collection by [Beacon](the-beacon-subsystem) and later [queried](the-query-subsystem) and visualized.

[Learn more about collections](collections)

### Dimensions: Describe data
A dimension is an descriptive attribute or characteristic of an object that can be given different values.
For example, a geographic location could have dimensions called Latitude, Longitude, or City Name.
Values for the City Name dimension could be San Francisco, Berlin, or Singapore.
Browser, Device, Date are all examples of dimensions that may appear as part of joola.io.

[Learn more about dimensions](dimensions)

### Metrics: Measure data
Metrics are individual elements of a dimension that can be measured as a sum or a ratio.
For example, the dimension City can be associated with a metric like Population, which would have a sum value of all the residents of the specific city.
Visits, Page per Visit, and Average Visit Duration are examples of metrics that may be part of joola.io.

[Learn more about metrics](metrics)