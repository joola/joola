REPORTER = spec
test:
		$(MAKE) lint
		echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
		@NODE_ENV=test ./node_modules/.bin/mocha -b --require blanket --reporter $(REPORTER)

lint:
		./node_modules/.bin/jshint ./joola.io.js

test-cov:
		$(MAKE) test REPORTER=spec
		$(MAKE) test REPORTER=html-cov 1> coverage.html

test-coveralls:
		npm install mocha-lcov-reporter
		$(MAKE) test REPORTER=spec
		$(MAKE) test REPORTER=mocha-lcov-reporter | ./node_modules/.bin/coveralls --verbose
		rm -rf lib-cov

.PHONY: test
