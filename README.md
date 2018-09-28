# ts-transformer-imports
A TypeScript custom transformer which transforms absolute imports (from `baseUrl`) to relative ones. This means such packages can be published and used within other projects without manually setting up `paths` or relying on babel or tsconfig-paths/register.

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![Downloads](https://img.shields.io/npm/dm/ts-transformer-imports.svg)](https://www.npmjs.com/package/ts-transformer-imports)

## Reasons why this exists

* https://github.com/Microsoft/TypeScript/issues/5039
* https://github.com/Microsoft/TypeScript/issues/15479
* https://github.com/Microsoft/TypeScript/issues/16088
* https://github.com/Microsoft/TypeScript/issues/10866
* https://github.com/Microsoft/TypeScript/issues/24599
* https://stackoverflow.com/questions/50019789/how-to-compile-typescript-modules-with-baseurl-paths-settings-in-tsconfig

# Requirement
TypeScript >= 2.4.1

# How to use this package

## How to use the custom transformer

Unfortunately, TypeScript itself does not currently provide any easy way to use custom transformers (See https://github.com/Microsoft/TypeScript/issues/14419).
The followings are the example usage of the custom transformer.

## ttypescript

See [examples/ttypescript](examples/ttypescript) for detail.
See [ttypescript's README](https://github.com/cevek/ttypescript/blob/master/README.md) for how to use this with module bundlers such as webpack or Rollup.

```js
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "plugins": [
      { "transform": "ts-transformer-imports" }
    ]
  },
  // ...
}
```

## TypeScript API

<!-- See [test](test) for detail.
You can try it with `$ npm test`. -->

```js
const ts = require('typescript');
const importsTransformer = require('ts-transformer-imports').default;

const program = ts.createProgram([/* your files to compile */], {
  strict: true,
  noEmitOnError: true,
  target: ts.ScriptTarget.ES5
});

const transformers = {
  before: [importsTransformer(program)],
  after: []
};
const { emitSkipped, diagnostics } = program.emit(undefined, undefined, undefined, false, transformers);

if (emitSkipped) {
  throw new Error(diagnostics.map(diagnostic => diagnostic.messageText).join('\n'));
}
```

# License

MIT

[travis-image]:https://travis-ci.org/grrowl/ts-transformer-imports.svg?branch=master
[travis-url]:https://travis-ci.org/grrowl/ts-transformer-imports
[npm-image]:https://img.shields.io/npm/v/ts-transformer-imports.svg?style=flat
[npm-url]:https://npmjs.org/package/ts-transformer-imports

# Thanks to

* https://gist.github.com/rifler/39fdcd92e78505bbc94dc5b9f845292b
* https://github.com/kimamula/ts-transformer-keys
* https://github.com/dsherret/ts-simple-ast
