module.exports = {
  name: 'beacon',
  runOptions: {
    limit: 1,         // concurrent connections
    iterations: 10,  // number of iterations to perform
    progress: 1000
    //prealloc: 10     
  },
  flow: {
    before: [],      // operations to do before anything
    beforeMain: [],  // operations to do before each iteration
    main: [  // the main flow for each iteration, #{INDEX} is unique iteration counter token
      { post: JOOLA_ADDRESS + '/api/beacon/insert?APIToken=apitoken-root', json: require('../../test/fixtures/benchmark-single.json')}
    ],
    afterMain: [],   // operations to do after each iteration
    after: []        // operations to do after everything is done
  }
};