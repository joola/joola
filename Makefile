REPORTER=spec

COVERALLS_GIT_COMMIT=HEAD
COVERALLS_REPO_TOKEN=wARcyyXr287WPS70cpaYzzUPjAyxPZHQH

export COVERALLS_GIT_COMMIT
export COVERALLS_REPO_TOKEN

TOP ?= $(shell pwd)

test:
		$(MAKE) lint
		@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER)

authors:
		node build/authors.js

compile:
		@NODE_ENV=test
		browserify ./lib/sdk/index.js -i ./lib/sdk/bin/joola.js -o ./lib/sdk/bin/joola.js --debug
    
lint:
		@./node_modules/.bin/jshint ./lib ./test

doc:
		find ./pages/docs/* ! -iregex '(.git|.npm)' | xargs rm -fr
		tail -n +4 ./apiary.apib > ./wiki/technical-documentation/code/API-Documentation.md
		rm -rf /tmp/wiki/*
		mkdir -p /tmp/wiki/
		cp -R ./wiki/* /tmp/wiki
		cp -R ./build/pages/resources/gollum-site/* /tmp/wiki
		cd /tmp/wiki && git init && gollum-site generate --output_path=$(TOP)/pages/docs --base_path /docs/ --working
		cd $(TOP)
		rm -rf /tmp/wiki/*
		cd pages && jekyll build
		rm -rf /usr/share/nginx/html/*
		mkdir -p /usr/share/nginx/html/
		cp -R ./pages/_site/* /usr/share/nginx/html
		
		git checkout --orphan gh-pages
		git rm -rf --cached .
		cp -R ./build/pages/resources/.gitignore ./.gitignore
		
		mv ./pages/_site/* .
		rm -rf ./pages/_site
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
		node joola.js &
		sleep 2
		-dredd -r html apiary.apib http://localhost:8080
		killall -9 node

publish:
		npm shrinkwrap
		npm publish
		rm npm-shrinkwrap.json
		
.PHONY: test

