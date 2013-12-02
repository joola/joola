REPORTER=spec

COVERALLS_GIT_COMMIT=HEAD
COVERALLS_REPO_TOKEN=Che5WhsI4mbjDKH9dnrrxoFJ06ivbNzxs

export COVERALLS_GIT_COMMIT
export COVERALLS_REPO_TOKEN

test:
		$(MAKE) lint
		@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER)

authors:
		node build/authors.js

compile:
		@NODE_ENV=test
		node build/compilesdk.js

lint:
		@./node_modules/.bin/jshint ./lib

test-cov:
		$(MAKE) test REPORTER=spec
		@NODE_COV=true NODE_ENV=test ./node_modules/.bin/mocha --reporter=html-cov > coverage.html

test-coveralls:
		@NODE_ENV=test ./node_modules/.bin/mocha --require blanket --reporter mocha-lcov-reporter | node ./node_modules/coveralls/bin/coveralls.js

doc:
		find ./wiki/* ! -iregex '(.git|.npm)' | xargs rm -fr
		node build/docs.js

.PHONY: test
