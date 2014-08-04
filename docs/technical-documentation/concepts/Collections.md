[HOME](Home) > [CONCEPTS](basic-concepts) > **COLLECTIONS**

Collections are used to store *documents* and they also contain metadata to describe the document, its dimensions,
metrics and other descriptive information and guidelines on how to process the documents into meaningful insight.

>
Collections belong to *organizations*, an organization may have as many collections as wished.
Only users that belong to that organization can access its collections and only users with the correct roles and permissions can add, modify and delete collections.
If a collection is not specified when using the SDK, then the current user's organization is assumed and used.
[Learn more](lib\\dispatch\\collections (jsdoc)).

A collection has a minimum set of required attributes to describe it.

```js
"collection": {
  "id": "dummy-collection",
  "name": "Dummy Collection",
  "description": "Dummy collection for documentation",
  "type": "typed"
}
```

```id``` holds a unique identifier (string) for the collection.  
```name``` holds the a pretty display name of the collection.  
```description``` is an optional attribute for describing the collection and it contents.  
```type``` collections can be either typed or ad-hoc collections.

## Collection Types
There are two available types of collections, typed and ad-hoc.
The main difference between the two is if the collection metadata gets updated based on documents pushed via [Beacon](the-beacon-subsystem).

### Typed Collections
(Strong) typed collections are pre-defined collections that do not change based on the data pushed by [Beacon](the-beacon-subsystem).
This option is enable you to apply advanced permissions, mapping, canvases and more features which requires you to ensure that collection metadata never changes in an uncontrolled manner.
If we allow the collection to be updated based on documents pushed, then we risk losing valuable metadata (permissions for example) due to a problem in the push process.

Other than this restriction, there are no major differences between the two types. Working with typed collections enable you to control the collection metadata via the SDK or the management console.
For organizations requiring a stable and coherant pipeline of changes, this is the best approach since it allow you to test changes in a QA environment, and when you're ready ship them
to Production.

Creating typed collections is easy.
```js
var collection = {
	"name": "dummy-adhoc-collection",
	"id": "dummy-adhoc-collection",
	"ip": {
		"name": "ip",
		"key": "ip",
		"type": "dimension",
		"datatype": "ip"
	},
	"username": {
		"name": "username",
		"key": "username",
		"type": "dimension",
		"datatype": "string"
	},
	"timestamp": {
		"name": "timestamp",
		"key": "timestamp",
		"type": "dimension",
		"datatype": "date"
	},
	"user_id": {
		"name": "user_id",
		"key": "user_id",
		"type": "dimension",
		"datatype": "string"
	},
	"visits": {
		"name": "visits",
		"key": "visits",
		"type": "metric",
		"datatype": "number"
	}
}

joola.collections.add(collection);
```


### Ad-hoc collections
An ad-hoc collection is a collection that was created as a result of a [Beacon](the-beacon-subsystem) push, this means that the metadata
was gathered from the document and was **assumption based**. For example, if we don't have a collection named `dummy-adhoc-collection` and we push a document into
 a collection with that name, on the first push, a new collection will be created. joola will scan the document and based on a pre-defined logic it will try to
 determine which document attributes are dimensions and which are metrics. Based on this logic, it will store the collection metadata and it will be used later when queried and visualizations are
 rendered.

```js
// We don't have collection named `dummy-adhoc-collection`
var doc = {
	timestamp: new Date(),
	user_id: '123',
	username: 'username',
	ip: '123.123.123.123',
	visits: 1
};

joola.beacon.insert('dummy-adhoc-collection', doc, function(err) {
	joola.collections.get('dummy-adhoc-collection', function(err, meta) {
		console.log(meta);
	});
});

// Here's is the meta of the collection
{
	"name": "dummy-adhoc-collection",
	"id": "dummy-adhoc-collection",
	"ip": {
		"name": "ip",
		"key": "ip",
		"type": "dimension",
		"datatype": "ip"
	},
	"username": {
		"name": "username",
		"key": "username",
		"type": "dimension",
		"datatype": "string"
	},
	"timestamp": {
		"name": "timestamp",
		"key": "timestamp",
		"type": "dimension",
		"datatype": "date"
	},
	"user_id": {
		"name": "user_id",
		"key": "user_id",
		"type": "dimension",
		"datatype": "string"
	},
	"visits": {
		"name": "visits",
		"key": "visits",
		"type": "metric",
		"datatype": "number"
	}
}
```

Notice how joola transformed the undescriptive pushed document into a full metadata set. It used a few assumptions, for example:

- **timestamp** is marked as `type=timestamp` because it was of type Date. joola checks for the data type of the value and if it's a date, it marks type timestamp.
- **ip** is now marked as `type=ip`, this is because of the name of the field.
- **visits** is marked as a `type=metric` because it was a number and not a string. any numeric values are treated as metrics.
- **user_id** is marked as a dimension with `type=string`, this is because it was a string input, if we would have used an int, it would have resulted with it being marked as a metric.


#### Specifying Metadata on Push
If you wish, you can specify metadata when you push a document, this can come in handy when you wish for example to use a key of ipaddress for a dimension instead of ip, but still wish joola
 to treat the value as an IP when querying and visualizing it.

```js
var doc = {
	timestamp: new Date(),
	user_id: '123',
	username: 'username',
	ipaddress: {key: 'ipaddress', name: 'IP Address', type: 'dimension', datatype: 'ip', value: '123.123.123.123'},
	visits: 1
};

joola.beacon.insert('dummy-adhoc-meta-collection', doc, function(err) {
	joola.collections.get('dummy-adhoc-meta-collection', function(err, meta) {
		console.log(meta);
	});
});

// Here's is the meta of the collection, truncated for brevity
{
	"name": "dummy-adhoc-collection",
	"id": "dummy-adhoc-collection",
	"ipaddress": {
		"name": "IP Address",
		"key": "ipaddress",
		"type": "dimension",
		"datatype": "ip"
	},
	...
}
```

You'll notice that the `ipaddress` dimension is marked with the correct key, name and datatype. You can of course do the same with metrics.

[Learn more about setting up collections](lib\\dispatch\\collections (jsdoc))

