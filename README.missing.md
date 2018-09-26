# missing bits from the README


Unfortunately, TypeScript itself does not currently provide any easy way to use custom transformers (See https://github.com/Microsoft/TypeScript/issues/14419).
The followings are the example usage of the custom transformer.

### webpack (with awesome-typescript-loader)

See [examples/webpack](examples/webpack) for detail.

```js
// webpack.config.js
const importsTransformer = require('ts-transformer-imports').default;

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        options: {
          getCustomTransformers: program => ({
              before: [
                  importsTransformer(program)
              ]
          })
        }
      }
    ]
  }
};

```

## Rollup (with rollup-plugin-typescript2)

See [examples/rollup](examples/rollup) for detail.

```js
// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import importsTransformer from 'ts-transformer-imports';

export default {
  // ...
  plugins: [
    typescript({ transformers: [service => ({
      before: [ importsTransformer(service.getProgram()) ],
      after: []
    })] })
  ]
};

```

## TypeScript API

See [test](test) for detail.
You can try it with `$ npm test`.

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

As a result, the TypeScript code shown [here](#how-to-use-keys) is compiled into the following JavaScript.

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_transformer_keys_1 = require("ts-transformer-imports");
var keysOfProps = ["id", "name", "age"];
console.log(keysOfProps); // ['id', 'name', 'age']
```
