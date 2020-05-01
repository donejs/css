# done-css

[![Build Status](https://travis-ci.org/donejs/css.svg?branch=worker)](https://travis-ci.org/donejs/css)
[![npm version](https://badge.fury.io/js/done-css.svg)](http://badge.fury.io/js/done-css)

A CSS plugin for DoneJS projects.

This is the normal Steal CSS plugin with a few DoneJS specific features like live-reload and server-side rendering included.

## Install

To use this plugin in a DoneJS project just install it:

```js
npm install done-css --save
```

## Features

### renderingCacheVersion

When server-side rendering with [done-ssr](https://github.com/donejs/done-ssr) and using the [cache busting](https://stealjs.com/docs/config.cacheVersion.html) extension you need to specify the `renderingCacheVersion` property in your config. You might do so like this:

```js
const ssr = require("done-ssr");

const render = ssr({
	renderingCacheVersion: 99
});
```

Doing this will result in the cache version number appearing in the server-rendered `<link>` elements.

## Contributing

To setup your dev environment:

1. Clone and fork this repo.
2. Run `npm install`.
3. Open `test/test.html` in your browser. Everything should pass.
4. Run `npm test`. Everything should pass.
5. Run `npm run-script build`. Everything should build ok.
To publish:

1. Update the version number in package.json
2. Update the version number in `test/live-ssr/index.html`
3. Commit and push this to master
4. Tag it `git tag v0.2.0`. Push the tag `git push origin --tags`.

## License

MIT
