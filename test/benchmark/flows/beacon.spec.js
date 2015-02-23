module.exports = {
  name: 'beacon',
  runOptions: {
    limit: 10,         // concurrent connections
    iterations: 100,  // number of iterations to perform
    progress: 5000
    //prealloc: 10
  },
  flow: {
    before: [],      // operations to do before anything
    beforeMain: [],  // operations to do before each iteration
    main: [  // the main flow for each iteration, #{INDEX} is unique iteration counter token
      {
        post: JOOLA_ADDRESS + '/insert/benchmark?APIToken=apitoken-demo',
        json: require('../../test/fixtures/benchmark-single.json')
      }
    ],
    afterMain: [],   // operations to do after each iteration
    after: []        // operations to do after everything is done
  }
};