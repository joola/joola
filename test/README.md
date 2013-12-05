### Automated Testing

Automated testing is an important and integral part of joola.io and are divided into three main parts:
##### Functional

Series of tests aimed to evaulate the system's functionality and behavior, this are the common tests that most projects
have.

##### Flow

This is a specific series of tests (executed by PhantomJS) aimed to evaluate system behavior when a process is taking place,
i.e. load the analytics interface, then navigate to a report and check that the CSS is setup correctly.

Another case where we test flow is with regards to caching. We need to make sure that the caching process has an accurate, repeatable and
consistant outcome.

##### Data Accuracy

It's critical to ensure that whenever a code change is implemented that it does not affect data accuracy in any way. This series of tests
 evaluate the accuracy of specific point of data and ensures that updates maintain data consistancy.

### Running tests

```bash
$ npm test
```

### Coverage

```bash
$ make test-cov
# navigate to the index.html page inside ./coverage/lcov-report
```