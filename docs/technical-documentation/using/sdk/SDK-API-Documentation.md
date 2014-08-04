[HOME](Home) > [SDK](sdk) > **API Documentation**

### SDK API Documentation
- [`joola`](#joola)
    - [`joola` properties](#joola-properties)
    - [`init(options, [callback])`](#initoptions-callback)
    - [`beacon`](#joolabeacon)
        - [`insert(collection, documents, [callback])`](#joolabeaconinsertcollection-documents-callback)
            - [Collection processing](#collection-processing)
            - [Document processing](#document-processing)
    - [`query`](#joolaquery)
        - [`fetch(query, [callback])`](#joolaqueryfetchquery-callback)
            - [Query Result Structure](#query-result-structure)
            - [Timeframes](#timeframes)
            - [Intervals](#intervals)
            - [Filters](#filters)
            - [Calculated Metrics](#calculated-metrics)
            - [Dimension/Metric Transformations](#intervals)
    - [`viz`](#joolaviz)
        - [`new Canvas(options, [callback])`](#new-joolavizcanvasoptions-callback)
        - [`new DatePicker(options, [callback])`](#new-joolavizdatepickeroptions-callback)
        - [`new Metric(options, [callback])`](#new-joolavizmetricoptions-callback)
        - [`new MiniTable(options, [callback])`](#new-joolavizminitableoptions-callback)
        - [`new Pie(options, [callback])`](#new-joolavizpieoptions-callback)
        - [`new Sparkline(options, [callback])`](#new-joolavizsparklineoptions-callback)
        - [`new Geo(options, [callback])`](#new-joolavizgeooptions-callback)
        - [`new PunchCard(options, [callback])`](#new-joolavizpunchcardoptions-callback)
    - [Timezones](#timezones)
    - [Additional Resources](#additional-resources)
        
## `joola`

#### `joola` properties

joola has the following properties:
- `options` object containing all options used by the SDK for its operation.
- `VERSION` holds the current SDK version.
- `USER` holds the currently connected `user` object.

#### `init(options, [callback])`

Connects to a joola server with the following arguments:

- `options` - An object with the host configuration:
  - `host` - the hostname or IP address of the joola server. Set to `127.0.0.1` or `localhost` if you're running on the same host as your joola server.
  - `token` - A token generated via [`joola.auth.generateToken`](https://github.com/joola/joola/wiki/lib%5Cauth%5Cindex%20(jsdoc)).
  - `APIToken` - the API Token to use when exchanging data with the server.
- `callback` - If provided, `callback(err)` is called once the SDK is ready. If an error as occurred then `err` will contain the details.

```js
var joola = require('joola.sdk');
joola.init({host: 'https://localhost:8081', APIToken: 'apitoken-demo function(err) {
  if (err)
    throw err;
  console.log('joola initialized', joola.VERSION);
});
```

### `joola.beacon`

Used to store, retrieve, update and delete documents within a [collection](http://github.com/joola/joola/wiki/Collections).
A valid document is any JSON valid document. 

#### `joola.beacon.insert(collection, documents, [callback])`

Insert a document or an array of documents into the provided `collection`. Upon completion, `callback(err, documents)` is called.

- `collection` - the name of the collection to write the document into.
- `documents` - A JSON object, or an array of JSON objects describing the information to store.
- `callback(err, documents)` - called on completion with `err` containing any errors raised or null. `documents` contain an array of JSON objects, one for every sent document, however they now contain additional flags relating to the save process.

```js
joola.beacon.insert('visits', {username: 'thisisme', visits: 1}, function(err, saved){
  console.log('Saved document with key: ', saved._key);
});
```

##### Collection processing
It's not required for a collection to be pre-defined before pushing the first document. 
In such a case, the meta of the document, or the top document in case of an array is used to build the collection's meta.

When pushing a document with a new meta, the collection meta will get updated accordingly, however, the collection meta can only be expanded, i.e. more attributes added.
In case that a document with fewer attributes is pushed, no meta change will occur. In order to modify or delete attributes from a collection, please refer to [Collection Management](http://github.com/joola/joola/wiki/Collections).

##### Document processing
Documents are processed in the order they are sent, it is highly recommended that whenever possible documents are batched into an array, rather than sent one-by-one.
Each document is assigned with a unique key based on its attributes (not metrics) and this key is checked when inserting new documents to prevent duplicates. Duplicate documents are not allowed and an error will be returned if a duplicate is found.

When joola returns the saved document collection via the `callback` of the `joola.beacon.insert` call, each document in the array has two additional attributes:
 
 - `saved` bool indicating if the save completed.
 - `error` string containing any error message from the underlying caching database.

### `joola.query`

Used to query and analyze stored documents.

#### `joola.query.fetch(query, [callback])`

Query joola for a set of documents based on criteria passed in `query`. Upon completion, `callback(err, results)` is called.

<a name="query"></a>
`query` holds the following options:

- `timeframe` - timeframe for the query, can be either a [shorthand timeframe](#timeframes) or an object with:
  - `start` - start date for the query.
  - `end` - end date for the query.
- `interval` - a string specifying the [interval](#intervals) for the query.
- `dimensions` - an array of string/object containing definitions for dimensions requested. You can specify the dimension name as `string` literal or use a JSON object with:
  - `key` - the dimension name as passed in the document. Nesting is supported, for example: `user.username`.
  - `name` - a display name for the dimension that can be used by visualizations.
  - `datatype` - date type of the dimension, currently supported: `date`, `string` and `ip`.
  - `transform` - a string containing a javascript function to run on the value before returning results. See [Dimension/Metric Transformations](#dimensionmetric-transformations) for more details.
- `metrics` - an array of string/object containing definitions for metrics requested. You can specify the metric name as `string` literal or use a JSON object with:
  - `key` - the metric name as passed in the document. Nesting is supported, for example: `visits.count`.
  - `name` - a display name for the metric that can be used by visualizations.
  - `aggregation` - aggregation type for the metric, currently supported: `sum`, `avg`, `ucount`, `min`, `max`.
  - `prefix` - string to add before the value, for example '$'.
  - `suffix` - string to add after the value, for example 'MB'.
  - `decimals` - number of decimal points to return, for example: 4 will yield 1.1234. 
  - `dependsOn` - if this is a calculated metric, then specify here what is the base metric for the calculation. 
  - `filter` - a [filter](#filters) object.
  - `transform` - a string containing a javascript function to run on the value before returning results. See [Dimension/Metric Transformations](#dimensionmetric-transformations) for more details.
  - `formula` - an object containing the formula defintions:
    - `dependsOn` - an array of metric names/objects
    - `run` - a string containing the javascript function to run on the values. See [calculated metrics](#calculated-metrics) for additional information.
  - `collection` - a string specifying the collection to take the metric from.
- `filter` - An array of [filters](#filters).
- `realtime` - Specify that this is a realtime query and results are expected back from the server every 1 second.

`callback` returns any `err` if encountered or null if none. `results` holds a JSON object with the structure detailed under [Query Response Structure](#query-response-structure). 

```js
var query = {
  timeframe: 'last_hour',
  interval: 'minute',
  dimensions: [],
  metrics: ['visits']
};

joola.query.fetch(query, function(err, results) {
  console.log('We have results, count: ', results.documents.length);
});
```

##### Query Result Structure

Query results have the following structure:  

```js
{
	uid: "XR64MxKg5" //unique identifier for the query
	resultCount: 123, //count of results returned
	dimensions: [ //array of dimensions participating
		{
			attribute: "ip",
			datatype: "ip",
			key: "ip",
			name: "ip",
			type: "dimension"
		}
	],
	metrics: [ //array of metrics participating
		{
			key: "clicks",
			aggregation: "sum",
			attribute: "clicks",
			datatype: "number",
			name: "Click Count",
			type: "metric",
			suffix: "(# of clicks)"
		}
	],
	documents: [ //array of documents returned
    {
    	fvalues: { //object with formatted values
        clicks: "123 (# of clicks)"
    	}
    	values: { //object with non-formatted values
        clicks: 123
    	}
    }
	],
	stats: { //object containing query statistics
		times: {
			duration: 147, //run duration in ms.
      end: "2014-02-14T19:11:07.015Z",
      start: "2014-02-14T19:11:06.868Z"
		}
	}
}
```

##### Timeframes

Timeframes provide a shorthand for specifying the query from/to dates. The full representation of a timeframe is:
```js
{
	start: new Date(2014, 1, 14),
	end: new Date(2014, 1, 14, 23, 59, 59, 999)
}
```
We took the more common timeframes and created a shorthand string for them. There are three main groups of timeframes: `this`, `last` and `previous`:

- `this_n_seconds` - creates a timeframe with all of the current second and the previous completed n-1 seconds.
- `this_n_minutes` - creates a timeframe with all of the current minute and the previous completed n-1 minutes.
- `this_n_hours` - creates a timeframe with all of the current hour and the previous completed n-1 hours.
- `this_n_days` - creates a timeframe with all of the current day and the previous completed n-1 days.
- `this_n_months` - creates a timeframe with all of the current month and the previous completed n-1 months.
- `this_n_years` - creates a timeframe with all of the current year and the previous completed n-1 years.
- `last_n_second` - creates a timeframe with the start of `n` seconds before the most recent second and an end at the most recent second. Example: if right now it is 08:30:43.555 and we use “last_3_seconds”, this will result in a timeframe of 08:30:40 until 08:30:43.
- `last_n_minute` - creates a timeframe with the start of `n` minutes before the most recent second and an end at the most recent second. Example: if right now it is 08:30:43 and we use “last_3_minutes”, this will result in a timeframe of 08:27:43 until 08:30:43.
- `last_n_hour`- creates a timeframe with the start of `n` hours before the most recent second and an end at the most recent second. Example: if right now it is 08:30:43 and we use “last_3_hours”, this will result in a timeframe of 05:30:43 until 08:30:43.
- `last_n_day` - creates a timeframe with the start of `n` days before the most recent second and an end at the most recent second. Example: if right now it is 2014-02-14 08:30:43 and we use “last_3_days”, this will result in a timeframe of 2014-02-11 08:30:43 until 201-02-14 08:30:43.
- `last_n_month` - creates a timeframe with the start of `n` months before the most recent second and an end at the most recent second. Example: if right now it is 2014-02-14 08:30:43 and we use “last_3_months”, this will result in a timeframe of 2013-11-14 08:30:43 until 201-02-14 08:30:43.
- `last_n_years` - creates a timeframe with the start of `n` years before the most recent second and an end at the most recent second. Example: if right now it is 2014-02-14 08:30:43 and we use “last_3_years”, this will result in a timeframe of 2011-02-14 08:30:43 until 201-02-14 08:30:43.
- `previous_n_second` - creates a timeframe with the start of `n` seconds before the most recent complete second and an end at the most recent complete second. Example: if right now it is 08:30:43.555 and we use “previous_3_seconds”, this will result in a timeframe of 08:30:40 until 08:30:43.
- `previous_n_minute` - creates a timeframe with the start of `n` minutes before the most recent complete minute and an end at the most recent complete minute. Example: if right now it is 08:30:43 and we use “previous_7_minutes”, this will result in a timeframe of 08:23 until 08:30.
- `previous_n_hour` - creates a timeframe with the start of `n` hours before the most recent complete hour and an end at the most recent complete hour. Example: if right now it is 08:30:43 and we use “previous_3_hours”, this will result in a timeframe of 05:00 until 08:00.
- `previous_n_day` - creates a timeframe with the start of `n` days before the most recent complete minute and an end at the most recent complete day. Example: if right now it is 2014-02-14 08:30:43 and we use “previous_7_days”, this will result in a timeframe of 2014-02-07 until 2014-02-14.
- `previous_n_month` - creates a timeframe with the start of `n` months before the most recent complete month and an end at the most recent complete month. Example: if right now it is 2014-02-14 08:30:43 and we use “previous_4_months”, this will result in a timeframe of 2013-10-01 until 2014-02-01.
- `previous_n_years` - creates a timeframe with the start of `n` years before the most recent complete year and an end at the most recent complete year. Example: if right now it is 2014-02-14 08:30:43 and we use “previous_3_years”, this will result in a timeframe of 2011-01-01 until 2014-01-01.

###### Synonyms
- `today` - synonym for `this_day`.
- `yesterday` - synonym for `previous_1_day`.
- `this_second` - synonym for `this_1_second`.
- `this_minute` - synonym for `this_1_minute`.
- `this_hour` - synonym for `this_1_hour`.
- `this_day` - synonym for `this_1_day`.
- `this_month` - synonym for `this_1_month`.
- `this_year` - synonym for `this_1_year`.
- `last_second` - synonym for `last_1_second`.
- `last_minute` - synonym for `last_1_minute`.
- `last_hour` - synonym for `last_1_hour`.
- `last_day` - synonym for `last_1_day`.
- `last_month` - synonym for `last_1_month`.
- `last_year` - synonym for `last_1_year`.
- `previous_second` - synonym for `previous_1_second`.
- `previous_minute` - synonym for `previous_1_minute`.
- `previous_hour` - synonym for `previous_1_hour`.
- `previous_day` - synonym for `previous_1_day`.
- `previous_month` - synonym for `previous_1_month`.
- `previous_year` - synonym for `previous_1_year`.

##### Intervals

Intervals are based on the document's [timebucket](#), and the following are available: `second`, `minute`, `hour`, `day`, `month` and `year`.

Also, there are two additional special attributes: 
- `timebucket.dow` stores the day of week
- `timebucket.hod` stored the hour the day
This two can be used when looking to compose visualizations or results based on day of week/hour of day, such as the [PunchCard](#joola-viz-punchcardoptions-callback) visualization.

##### Filters

Filters are used to set a query criteria. The syntax is simple and can is based on an array of the following:
- `attribute` - the name of the document attribute to test against the `match`. For example, `user.username`.
- `operator` - the operator to apply between the attribute and the match, here are the supported operators:
	- `eq` - Matches values that are equal to the value specified in `match`.
	- `gt` - Matches values that are greater than the value specified in `match`.
	- `gte` - Matches values that are equal to or greater than the value specified in `match`.
	- `in` - Matches any of the values that exist in an array specified in `match`.
	- `lt` - Matches values that are less than the value specified in `match`.
	- `lte` - Matches values that are less than or equal to the value specified in `match`.
	- `ne` - Matches all values that are not equal to the value specified in `match`.
	- `nin` - Matches values that *do not exist* in an array specified in `match`.
	- `regex` - Selects documents where `attribute` match a specified regular expression.
- `match` - a string or array containing values to test `attribute` against using the `operator`.

```js
var query = {
  timeframe: 'last_hour',
  interval: 'minute',
  dimensions: [],
  metrics: [{
    key: 'visits',
    name: 'Visit Count'
  }],
  filter: [
  	['user.username', 'eq', 'thisisme']
  ]
};

joola.query.fetch(query, function(err, results) {
  console.log('We have results, count: ', results.documents.length);
});
```


##### Calculated Metrics

Calculated metrics offer you the option to query existing metric(s) and based on their values, perform a calculation that is later returned as part of the results.
In order to query a calculated metric you'll need to use the `formula` attribute:
- `dependsOn` - an array of metric names or objects. Each will be passed to the run function according to the order specifying in the array.
- `run` - a string containing a javascript function. The function is called with the metrics specifying in the `dependsOn` parameter and need to return a value which is then returned as part of the result set.

```js
var query = {
  timeframe: 'last_hour',
  interval: 'minute',
  dimensions: [],
  metrics: [{
    key: 'visits', 
    name: 'Visit Count',
    formula: {
      dependsOn: ['visits', 'clicks'],
      run: 'function(visits, clicks) { return visits * clicks; }'
    }
  }]
};

joola.query.fetch(query, function(err, results) {
  console.log('We have results, count: ', results.documents.length);
});
```

##### Dimension/Metric Transformations

Transformations are used to alter the data output's `formattedValue` property, mainly for display purposes.

```js
var query = {
  timeframe: 'last_hour',
  interval: 'minute',
  dimensions: [],
  metrics: [{
    key: 'bandwidth',
    name: 'Bandwidth (KB)', 
    transform: 'function(value) { return value / 1024 ; }'
    }]
};

joola.query.fetch(query, function(err, results) {
  console.log('We have results, count: ', results.documents.length);
});
```

### `joola.viz`

Used to transform queries into meaningful insights and visualizations.

All visualizations follow the same usage in an attempt to simply usage, however, all also include detailed options for controlling the visualization's specific attributes.
Charting is provided by [HighCharts][highcharts], but the extensible nature of the visualizations support developers wishing to use an alternative charting engine. 
The chart object is available directly for developers via `[viz].chart`, more about this in the visualization's docs below.
 
Dropping visualizations on a page is very easy, but most usage cases will require a blend of visualizations working together and responding commonly to certain events, for this purpose we have `Canvas`. 
Example: on a web page we have a couple of sparklines and metric boxes. We would like to be able to add a date box to the page and once the date range is updated, that all 
 visualizations react together to the change and update their contents to display results for the new range.  
To address this issue we'll add a `Canvas` to batch the visualizations on page and allow them to interact, more about this topic below.

There are a few methods for drawing visualizations:

Using jQuery:
```js
var options = {
  query: {
    timeframe: 'last_hour',
    interval: 'minute',
    dimensions: [],
    metrics: ['visits']
  }
};
$('#metric').Metric(options);
```

Using Pure Javascript:
```js
new joola.viz.Metric({
  container: '#metric',
  query: {
    timeframe: 'last_hour',
    interval: 'minute',
    dimensions: [],
    metrics: ['visits']
  }
});
```

#### `new joola.viz.Canvas(options, [callback])`

#### `new joola.viz.DatePicker(options, [callback])`

#### `new joola.viz.Metric(options, [callback])`

Provides a Metric Visualization, a textual value with a caption.

<img src="http://i.imgur.com/K0hWSTk.png"></img>

###### Options
- `container` - HTML container to draw the visualization in.
- `caption` - caption for the metric box.
- `query` - same as a [`query.fetch.query`](#query) object.

###### Expanded DOM
```html
<div id="metric" jio-domain="joola" jio-type="metric" jio-uuid="dPtcAHNEH">
  <div class="jio metricbox caption">Clicks</div>
  <div class="jio metricbox value">3</div>
</div>
```

Participating CSS tags: `.jio.metricbox.caption`, `.jio.metricbox.value`

###### Example
```js
new joola.viz.Metric({
  container: '#metric',
  caption: 'Clicks',
  query: {
    timeframe: 'last_hour',
    interval: 'minute',
    dimensions: [],
    metrics: ['visits']
  }
});
```

#### `new joola.viz.MiniTable(options, [callback])`

#### `new joola.viz.Pie(options, [callback])`

#### `new joola.viz.Sparkline(options, [callback])`

#### `new joola.viz.Geo(options, [callback])`

#### `new joola.viz.PunchCard(options, [callback])`




## Timezones
All documents are stored with their timestamp and timezone.
Pushing a new document via `joola.beacon.insert` with `timestamp=null` will result in the server generating a `new Date()` timestamp and allocating it for you.

## Additional Resources
We are in the process of adding additional documentation, examples and walk-throughs, but in the meantime, if you have any question, make sure you [drop us a line](#contact).

### What's next?

- [Getting and using the SDK](using-the-sdk)
- [Security and authentication](security-and-authentication)
- [Pushing data](pushing-data)
- [Query, analytics and visualization](https://github.com/joola/joola/wiki/sdk-api-documentation#joolaviz)
- [Collections and meta data](collections)
- [Workspaces, users and roles](basic-concepts)
- **Complete API documentation**