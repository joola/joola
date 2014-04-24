module.exports = {
  name: 'metadata',
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
      { get: JOOLA_ADDRESS + '/api/system/nodeDetails?APIToken=apitoken-root' }
    ],
    afterMain: [],   // operations to do after each iteration
    after: []        // operations to do after everything is done
  }
};