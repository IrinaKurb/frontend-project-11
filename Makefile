develop:
	npx webpack serve
	rm -rf dist

install:
	npm ci

build: 
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .

remove:
	rm -rf dist
