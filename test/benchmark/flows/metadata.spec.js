module.exports = {
  name: 'metadata',
  runOptions: {
    limit: 500,         // concurrent connections
    iterations:5000,  // number of iterations to perform
    progress: 5000
    //prealloc: 10
  },
  flow: {
    before: [],      // operations to do before anything
    beforeMain: [],  // operations to do before each iteration
    main: [  // the main flow for each iteration, #{INDEX} is unique iteration counter token
      { get: JOOLA_ADDRESS + '/system/version?APIToken=apitoken-demo' }
    ],
    afterMain: [],   // operations to do after each iteration
    after: []        // operations to do after everything is done
  }
};