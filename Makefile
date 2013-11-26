REPORTER=spec

test:
		$(MAKE) compile
		$(MAKE) lint
		@NODE_ENV=test ./node_modules/.bin/mocha -b --require blanket --reporter $(REPORTER)

compile:
		@NODE_ENV=test
		node build/compilesdk.js

lint:
		./node_modules/.bin/jshint ./lib

test-cov:
		$(MAKE) test REPORTER=spec
		$(MAKE) test REPORTER=html-cov 1> coverage.html

test-coveralls:
		cp ./node_modules/mocha-lcov-reporter/lib/lcov.js ./node_modules/mocha/lib/reporters/mocha-lcov-reporter.js
		$(MAKE) test REPORTER=spec
		$(MAKE) test REPORTER=mocha-lcov-reporter | ./node_modules/.bin/coveralls --verbose
		rm -rf lib-cov

.PHONY: test
