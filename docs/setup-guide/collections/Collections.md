Collections are used to store *documents*. Collections describe the document, its dimensions, 
metrics and other descriptive information
and guidelines on how to process the documents into meaningful insight. A collection has a minimum set of required 
attributes to describe it.

```js
"collection": {
  "id": "dummy-collection",
  "name": "Dummy Collection",
  "description": "Dummy collection for documentation",
  "type": "data"
}
```

```id``` holds a unique identifier (string) for the collection.  
```name``` holds the a pretty display name of the collection.  
```description``` is an optional attribute for describing the collection and it contents.  
```type``` collections can be either data or lookup collections.  

## Collection Types
joola.io uses to types of collections to store data and produce insight.

#### Data collections
Store data to be queried and analyzed later. This is the more commonly used collection type.

//TODO:
Add examples

#### Lookup collections
These collections enable the system to join data collections with static dictionary type data.
This allows joola.io to extend dimensions and offer an even richer drill-down experience.

//TODO:
Add examples

[Learn more about setting up collections](Setting-up-collections)

## Using Collections



