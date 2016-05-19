#
# Binaries.
#

DUO = node_modules/.bin/duo
DUOT = node_modules/.bin/duo-test
ESLINT = node_modules/.bin/eslint

#
# Files.
#

SRCS_DIR = lib
SRCS = $(shell find $(SRCS_DIR) -type f -name "*.js")
TESTS_DIR = test
TESTS = $(shell find $(TESTS_DIR) -type f -name '*.test.js')

#
# Task config.
#

BROWSER ?= chrome

PORT ?= 0

DUOT_ARGS = \
	--reporter spec \
	--port $(PORT) \
	--commands "make build"

#
# Chore tasks.
#

# Install node dependencies.
node_modules: package.json $(wildcard node_modules/*/package.json)
	@npm install

# Remove temporary files and build artifacts.
clean:
	rm -rf .dist	
	rm -rf build.js
.PHONY: clean

# Remove temporary files, build artifacts, and vendor dependencies.
distclean: clean
	rm -rf components node_modules
.PHONY: distclean

#
# Build tasks.
#

# Build all integrations, tests, and dependencies together for testing.
build.js: node_modules component.json $(SRCS) $(TESTS)
	@$(DUO) --stdout --development $(TESTS) > $@

# Builds a version that injects the dev cdn value
stage-dev-build: clean
	mkdir -p .dist
	cp lib/index.js index.dev.tmp.js
	sed -i '' -e 's/var client_host.*/var client_host = \"pendo-dev-static.storage.googleapis.com\";/g' index.dev.tmp.js
	sed -i '' -e 's/var client_file.*/var client_file = \"\/js\/pa.js\";/g' index.dev.tmp.js

build-dev: stage-dev-build
	@$(DUO) --stdout --development index.dev.tmp.js > .dist/analytics.dev.js
	rm -f index.dev.tmp.js

# Builds a version that injects the dev cdn value
stage-dev-local: clean
	mkdir -p .dist
	cp lib/index.js index.dev.tmp.js
	sed -i '' -e 's/var client_host.*/var client_host = \"pendo-devserver-static.storage.googleapis.com\";/g' index.dev.tmp.js
	sed -i '' -e 's/var client_file.*/var client_file = \"\/js\/pa.js\";/g' index.dev.tmp.js

build-local: stage-dev-local
	@$(DUO) --stdout --development index.dev.tmp.js > .dist/analytics.local.js
	rm -f index.dev.tmp.js

# Build shortcut.
build: build.js
.DEFAULT_GOAL = build

#
# Test tasks.
#

# Lint JavaScript source.
lint: node_modules
	@$(ESLINT) $(SRCS) $(TESTS)
.PHONY: lint

# Test locally in PhantomJS.
test-phantomjs: node_modules build.js
	@$(DUOT) phantomjs $(TESTS_DIR) args: \
		--path node_modules/.bin/phantomjs
.PHONY: test

# Builds a variant that can be used for local testing as a client
test-local: node_modules component.json $(SRCS) 
	mkdir -p .dist 	
	@$(DUO) --stdout --development local/local-test.js > .dist/local.build.js
.PHONY: test

# Test locally in the browser.
test-browser: node_modules build.js
	@$(DUOT) browser --commands "make build" $(TESTS_DIR)
.PHONY: test-browser

# Test in Sauce Labs. Note that you must set the SAUCE_USERNAME and
# SAUCE_ACCESS_KEY environment variables using your Sauce Labs credentials.
test-sauce: node_modules build.js
	@$(DUOT) saucelabs $(TESTS_DIR) \
		--name analytics.js-integrations \
		--browsers $(BROWSER) \
		--user $(SAUCE_USERNAME) \
		--key $(SAUCE_ACCESS_KEY)
.PHONY: test-sauce

# Test shortcut.
test: lint test-phantomjs
.PHONY: test
