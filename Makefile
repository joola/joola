REPORTER=spec

COVERALLS_GIT_COMMIT=HEAD
COVERALLS_REPO_TOKEN=wARcyyXr287WPS70cpaYzzUPjAyxPZHQH

export COVERALLS_GIT_COMMIT
export COVERALLS_REPO_TOKEN

TOP ?= $(shell pwd)
BRANCH ?= $(git branch | sed -ne 's/^\* \(.*\/\1/p')

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

site:
    #cleanup any leftovers
		rm -rf ./about ./blog ./css ./docs ./img ./javascripts ./news ./stylesheets ./feed.xml ./index.html ./params.json
		find ./pages/docs/* ! -iregex '(.git|.npm)' | xargs rm -fr
		tail -n +4 ./apiary.apib > ./wiki/technical-documentation/code/API-Documentation.md
		rm -rf /tmp/wiki/*
		mkdir -p /tmp/wiki/

		#generate gollum site from wiki
		cp -R ./wiki/* /tmp/wiki
		cp -R ./build/pages/resources/gollum-site/* /tmp/wiki
		cd /tmp/wiki && git init && gollum-site generate --output_path=$(TOP)/pages/docs --base_path /docs/ --working
		cd $(TOP)
		rm -rf /tmp/wiki/*

		#build gh-pages site
		cp ./build/pages/resources/_config.yml ./pages/_config.yml
		cd pages && jekyll build
		rm -rf /usr/share/nginx/html/*
		mkdir -p /usr/share/nginx/html/
		cp -R ./pages/_site/* /usr/share/nginx/html

		#delete any pre-existing gh-pages and create
		git branch -qD gh-pages
		git checkout --orphan gh-pages
		git rm -rf --cached .
		cp -R ./build/pages/resources/.gitignore ./.gitignore

		#copy generated site to clean destination
		mv ./pages/_site/* .
		rm -rf ./pages/_site
		
		#commit to gh-pages
		git add .
		git commit -am "updated gh-pages."
		git push -f origin gh-pages
		
		#cleanup
		git checkout feature/#647
		rm -rf ./about ./blog ./css ./docs ./img ./javascripts ./news ./stylesheets ./feed.xml ./index.html ./params.json
		
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

