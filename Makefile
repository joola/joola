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
		browserify ./lib/sdk/index.js -i ./lib/sdk/bin/joola.io.js -o ./lib/sdk/bin/joola.io.js --debug
    
lint:
		@./node_modules/.bin/jshint ./lib ./test

doc:
		find ./wiki/* ! -iregex '(.git|.npm)' | xargs rm -fr
		node build/docs.js
		tail -n +4 ./apiary.apib > ./wiki/technical-documentation/code/API-Documentation.md
		sed -i '1i**View a live version of this page @ [http://docs.joolaio.apiary.io](http://docs.joolaio.apiary.io)**\n' ./wiki/technical-documentation/code/API-Documentation.md

test-cov:
		$(MAKE) lint
		$(MAKE) istanbul

test-cov-partial:
		./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha ./test/unit/starthere.spec.js ./test/unit/3_auth/routes.spec.js -- -R spec test

istanbul:
		./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- -R spec test

coveralls:
		cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

test-api:
		redis-cli flushall
		node joola.io.js &
		sleep 2
		-dredd -r html apiary.apib http://localhost:8080
		killall -9 node

publish:
		npm shrinkwrap
		npm publish
		
.PHONY: test

