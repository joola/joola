[HOME](Home) > [SETUP GUIDE](setting-up-joola.io) > **STEP 3: DEFINE COLLECTIONS**

Setting up collections is an easy task, it can be done using the management interface or directly using code. 

#### Add collections using code
In order to access joola.io using code please make sure you review [using joola.io SDK](joola.io-sdk).

```js
//Definitions for new collections
var newCollection = {
  id: 'myFirstCollection',
  name: 'My First Collection',
  description: 'This is my attempt with creating a collection',
  type: 'data',
}

//The actual instruction to add the new collection
joolaio.collections.add(newCollection, function(err, collection) { 
  if (err) //if error, report it
    throw err;
  
  //collection created succesfully, print it
  console.log('New collection added', collection);
});
```

[Learn more about adding, updating and deleting collections][lib-collections]

#### Add collections using the management interface
//TODO:
Add instructions

[lib-collections]: https://github.com/joola/joola.io/wiki/lib%5Cdispatch%5Ccollections%20(jsdoc)