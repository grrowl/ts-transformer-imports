# ts-transformer-imports

A TypeScript transformer which enables compilation of absolute imports (using `baseUrl` or `paths`) so they can be required as modules from Javascript or TypeScript, without additional configuration or path mapping.

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![Downloads](https://img.shields.io/npm/dm/ts-transformer-imports.svg)](https://www.npmjs.com/package/ts-transformer-imports)

<!--
## Why this exists / related issues

* https://github.com/Microsoft/TypeScript/issues/5039
* https://github.com/Microsoft/TypeScript/issues/15479
* https://github.com/Microsoft/TypeScript/issues/16088
* https://github.com/Microsoft/TypeScript/issues/10866
* https://github.com/Microsoft/TypeScript/issues/24599
* https://stackoverflow.com/questions/50019789/how-to-compile-typescript-modules-with-baseurl-paths-settings-in-tsconfig
-->

[Read more about why this exists and what problem it solves](https://medium.com/@grrowl/fixing-absolute-imports-in-typescript-797f405176eb)

# How to use this package

If you're using the TypeScript compiler and using TypeScript's native "absolute imports" mapping (specifying `baseUrl` or `paths` in your config), you've found none of the compiled code is usable in Javascript or unconfigured TypeScript.

## ttypescript

First, install `ttypescript`:

```
npm install --save-dev ttypescript
```

See [examples/ttypescript](examples/ttypescript) for detail, and [ttypescript's README](https://github.com/cevek/ttypescript/blob/master/README.md) for how to set up in your project.

Now, specify `ts-transfomer-imports` in your `tsconfig.json`:

```js
{
  "compilerOptions": {
    // ...
    "plugins": [
      { "transform": "ts-transformer-imports" }
    ]
  },
}
```

## Using with `ts-node`, `webpack`, etc

See [ttypescript's README](https://github.com/cevek/ttypescript/blob/master/README.md) for usage information with other compilers. It should work!

## TypeScript API

You probably won't need this. See [test](test) for more detail.

```js
const ts = require('typescript');
const importsTransformer = require('ts-transformer-imports').default;

const program = ts.createProgram([/* your files to compile */], {
  strict: true,
  noEmitOnError: true,
  target: ts.ScriptTarget.ES5
});

const transformers = {
  before: [importsTransformer(program)]
};
const { emitSkipped, diagnostics } = program.emit(undefined, undefined, undefined, false, transformers);
```

# TL;DR:

I don't want to write:

```js
// within a deep directory, this can be tedious on large projects
import isTruthy from '../../utils/isTruthy'
import AppView from '../views/app'
```

so [TypeScript allows me write](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping):

```js
import isTruthy from 'utils/isTruthy'
import AppView from 'views/app'
```

when `tsconfig.json` looks like this:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "utils": ["./utils"],
      "views": ["./components/views"],
    }
  }
}
```


but `tsc` compiles it to:

```js
const isTruthy = require('utils/isTruthy')
// At runtime, node will try to resolve the "utils" module dependency from within node_modules and fail
```

So `ts-transformer-import` transforms the emitted javascript this at typescript compile time:

```js
const isTruthy = require('../../utils/isTruthy')
const AppView = require('../views/app')
```

# Compatibility

TypeScript 2.4 and up

# License

MIT

[travis-image]:https://travis-ci.org/grrowl/ts-transformer-imports.svg?branch=master
[travis-url]:https://travis-ci.org/grrowl/ts-transformer-imports
[npm-image]:https://img.shields.io/npm/v/ts-transformer-imports.svg?style=flat
[npm-url]:https://npmjs.org/package/ts-transformer-imports

# Thanks to

* Massive thanks to everyone who has contributed with pull requests and other submissions to this project.
* https://gist.github.com/rifler/39fdcd92e78505bbc94dc5b9f845292b
* https://github.com/kimamula/ts-transformer-keys
* https://github.com/dsherret/ts-simple-ast
