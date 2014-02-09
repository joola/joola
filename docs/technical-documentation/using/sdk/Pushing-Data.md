[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [USING](using-joola.io) > **PUSHING DATA**

It's very easy to get data into joola.io. The technique to do so vary on the specific implementation and feature set required.  
Before we start, we'll assume that you've already [installed your joola.io](setting-up-joola.io) and that you've read the [Using the SDK guide](using-the-sdk).

>
**NOTE:** We will be using APIToken 12345 and host http://localhost:8080 for our examples.

### Basic Example
```js
var collection = 'collection-name';
var document = {
  timestamp: new Date(),
  attribute: 'This is an attribute',
  value: 123
};

joolaio.beacon.insert(collection, document, function(err, pushedDocument){
  if (err)
    throw err;
  
  console.log('Document saved', pushedDocument);
});
```
That's all it takes to push a new document into the collection. But what actually happens behind the scenes?  
This is what the framework process looks like:

- Authenticate and make sure we have permission to insert a document
- Check if the collection is already defined, if not create it with [the document meta data](collection-meta-data)
- Insert the document into the new collection
- If there's an error, report it back to the caller

### Pushing Multiple Documents
It's much more cost effective to batch documents together into an array if you wish to perform batch operations.

```js
var collection = 'collection-name';
var documents = [];
for (var i = 0 ; i < 100 ; i++){
  var document = {
    timestamp: new Date(),
    attribute: 'This is an attribute',
    value: i
  };
  documents.push(document);
}
joolaio.beacon.insert(collection, documents, function(err, pushedDocument){
  if (err)
    throw err;
  
  console.log('Document saved', pushedDocument);
});
```

This will result with the collection having 100 documents pushed into it, each document has a different value (based on the `i`).

### Pushing a Typed Document
As you've learned under the [collection meta data](collection-meta-data) topic, collections describe the data stored. 
You have a few ways to create and manage collections, `typed collections` are a good choice if you wish to describe the data yourself.

But what if you wish to describe the data as you push it in?
```js
var collection = 'collection-name';
var document = {
  timestamp: new Date(),
  attribute: 'This is an attribute',
  value: {key: value, type: string, value: 123}
  value2: {key: value2, name: 'Another Value', aggregation: 'avg', value: 123, prefix: 'avg.' decimals: 2}
};

joolaio.beacon.insert(collection, document, function(err, pushedDocument){
  if (err)
    throw err;
  
  console.log('Document saved', pushedDocument);
});
```

The above will result with the meta data for value now be marked as `type=string` and ensure it is handled as a dimension, rather than a metric.
The metric `value2` is described with specific requirements for average and prefix.
 
[**Learn more about collections, dimensions and metrics**](collections)