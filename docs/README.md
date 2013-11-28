#joola.io Documentation Source

#####If you're looking for the project's documentation, please check out the wiki section.

This folder stores the different sources files needed as part of the project's wiki.
This is excluding the ```code``` files which are based on JSDocs comment appearing as throughout the project's code.

##Building the docs

We have a build script stored under ```build/docs.js```. It uses jsdox to iterate through code files and generate a
matching markdown wiki page.

The build script is not called directly during publication process, we use ```make``` to execute the document building process.
Before running it empties the directory and perform additional needed actions.

```bash
$ make doc
```

Files will be placed in the project's root under the ```wiki``` folder.
This folder is the one actually being pushed to GitHub's wiki pages system.