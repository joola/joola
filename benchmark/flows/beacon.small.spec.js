module.exports = {
  name: 'beacon',
  runOptions: {
    limit: 1000,         // concurrent connections
    iterations: 15000,  // number of iterations to perform
    progress: 5000,
    prealloc: 1000
  },
  flow: {
    before: [],      // operations to do before anything
    beforeMain: [],  // operations to do before each iteration
    main: [  // the main flow for each iteration, #{INDEX} is unique iteration counter token
      {
        post: JOOLA_ADDRESS + '/insert/benchmark?APIToken=apitoken-demo',
        json: require('../../test/fixtures/benchmark-small.json')
      }
    ],
    afterMain: [],   // operations to do after each iteration
    after: []        // operations to do after everything is done
  }
};