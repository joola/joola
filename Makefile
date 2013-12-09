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
		browserify ./lib/sdk/browser.js -i ./lib/sdk/bin/joola.io.js -o ./lib/sdk/bin/joola.io.js --debug

lint:
		@./node_modules/.bin/jshint ./lib

doc:
		find ./wiki/* ! -iregex '(.git|.npm)' | xargs rm -fr
		node build/docs.js

test-cov:	
		$(MAKE) istanbul

istanbul:
		./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- -R spec test

coveralls:
		cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

.PHONY: test
