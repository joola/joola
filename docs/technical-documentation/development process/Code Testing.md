[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [DEVELOPMENT](the-development-process) > **CODE TESTING**

joola puts a lot of emphasis on code testing, we aspire to have 100% of code covered with tests.

We use the [Mocha][mocha] testomg framework for our test management, it's simple and straightforward. Running the test suite on your machine, should ensure that the system is functioning properly and that you have properly installed all required packages, dependencies, etc...

### Running Tests
You have a few options to start the tests, the most basic one is `npm test`, but other methods can come in handy if you wish to run a specific test or write your own.
```bash
$ npm test
# or
$ make test
# or
$ mocha 
```
For this and other examples of the testing framework, we'll assume that you've installed Mocha as a global package:
```bash
$ npm install -g mocha
```

### Running Specific Tests
Before we get started, we'll assume that you're familiar with [Mocha][mocha], if that's not the case, make sure you try their website for the basic documentation.  
joola is a "service" and requires the Mocha testing framework to init a new joola server instance before starting the tests, for this purpose, we've created a small
helper file named `test/unit/starthere.spec.js`. This small script starts a new instance and sets the required global variables used throughout the test suite.

When we wish to run a specific test, we can combine the `starthere` script with the specific test script, for example:
```bash
$ mocha test/unit/starthere.spec.js test/unit/1_runtime/grid.spec.js
```
This will execute the `starthere` script first which will bring joola online, and then run the `grid` set of tests against that instance.
 
### Test Configuration and Caveats
The tests use the basic configuration currently existing on the server, so if we're talking about a newly installed instance, it would be whatever exist in `config/baseline.json`.  

- When running the tests, it is assumed that no other active joola node is connected to the redis store used by the tests.
- The tests are designed to run on a new and non-initialized server, mainly on a Travis CI build.

### Writing your own tests
If you wish to contribute and add/modify tests, we welcome the help! Please refer to our [Contribution][contributing] section for additional information.
In general:

- Try to follow the existing code style of existing tests.
- Make sure you cover all cases as part of your tests.
- If your test needs to use fixtures, make sure these are available either online (as a gist maybe) or locally in the fixtures folder.




[mocha]: http://visionmedia.github.io/mocha/