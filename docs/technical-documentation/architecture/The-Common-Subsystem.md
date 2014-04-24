[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [ARCHITECTURE](architecture) > **COMMON**

As a framework, joola.io addresses many runtime issues, some are common and shared between the different framework sub-systems.
For example, several systems need to access mongo, so we have a common module to deal with mongo connections and actions.

All of these `common` modules can be found under `lib/common` with `index.js` acting as the main common library which can be accessed via <code><a href="lib\common\index (jsdoc)">joola.common</a></code>.

## Frequently Used Functions

##### joola.common.uuid()
Generates a random unique identifier, used throughout the framework when a new id needs to be generated.
```js
//generate a unique identifier;
var uuid = joola.common.uuid();
```

##### joola.common.hash(string)
Generates a hash based on the provided string, great for compiling keys.
```js
//generate a unique identifier;
var hash = joola.common.hash('string to hash');
```

## A Word About Modifiers
Modifying Javascript's Object/Date/String and other prototypes is BAD and should be avoided.

That said, we still use a few modifiers for several reasons:
- To create seamless conformity throughout the framework, for example Date.format()
- To override default JavaScript behavior for different reasons. For example, we override JSON.parse/stringify in order capture event loop blocks due to the synchrnoies nature of these calls.

In the long run, all of these modifiers will go away and be replaced with task/class specific functions.

## Common Modules
Below is a complete list of `common` modules:

[##INSERTSTRUCTURE_COMMON##]

