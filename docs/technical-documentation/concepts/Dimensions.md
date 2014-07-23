[HOME](Home) > [CONCEPTS](basic-concepts) > **DIMENSIONS**

### Dimensions: Describe data
A dimension is an descriptive attribute or characteristic of an object that can be given different values. 
For example, a geographic location could have dimensions called Latitude, Longitude, or City Name. 
Values for the City Name dimension could be San Francisco, Berlin, or Singapore.
Browser, Device, Date are all examples of dimensions that may appear as part of joola.
 
Dimensions are system wide (based on the system/user permissions) and may appear in all of your reports, 
though you might see different ones depending on the specific report. 
Use them to help organize, segment, and analyze your data. In some reports, you can add and remove dimensions to see different aspects of your data.

[Learn more about adding metrics](Setting-up-collections)

### Relationship between dimensions and metrics
Although dimensions and metrics can stand alone, they usually are used in conjunction with one another. 
The values of dimensions and metrics and the relationships between those values is what creates meaning in your data. 
For the greatest insights, dimensions are often associated with one or more metric.

In this example, the City dimension can be associated with the metrics Population and Area. 
A ratio metric, like Population Density, could also be created with this data, giving even more insight about each of these cities:

|DIMENSION|METRIC|METRIC|
|---------|------|------|
|**City**|**Area (in sq. miles)**|**Population**|
|San Francisco|231|800,000|
|Berlin|334|3.5 million|
|Singapore|224|5.2 million|

[Create reports combining Dimensions and Metrics](Setting-up-reports)
