[HOME](Home) > [CONCEPTS](basic-concepts) > **Workspaces**

A workspace is the outer most logical container available. Within workspaces reside [collections](collections), [users](users), [roles](roles) and all other metadata.
We use workspaces in order to separate between metadata and allow secure store and delivery of data based on the workspace configuration.

A common use case for workspaces is to support different environments. Using workspaces we can create for example a separate container for development, QA, staging, demo and production.
 They all share the same joola.io framework, however each contains its own configuration.
 
```js
[
  {
    "key": "_test",
    "description": "Workspace for internal joola.io tests",
    "name": "joola.io Framework Tests"
  },
  {
    "key": "_stats",
    "description": "Stores internal statistics of joola.io",
    "name": "Internal Stats"
  },
  {
    "key": "demo",
    "description": "A starter/playground workpsace",
    "name": "Demo Workspace"
  }
]
```
 
[API documentation on managing Workspaces](https://github.com/joola/joola.io/wiki/api-documentation#group-workspaces)
 