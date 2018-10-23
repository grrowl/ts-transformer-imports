const assert = require('assert').strict

const path = require('path')

const ts = require('typescript');
const importsTransformer = require('../transformer').default;

describe('Resolves baseUrl', () => {
  const COMPILE_OPTIONS = {
    "strict": true,
    "noEmitOnError": true,
    "baseUrl": "test/baseDir",
    "declaration": true
  }
  const FILE = path.resolve(__dirname, 'named-base.ts')
  const program = ts.createProgram([FILE], COMPILE_OPTIONS);

  it('should transform named import', (done) => {
    const callback = (filename, compiledSource) => {
      if (filename.endsWith('named-base.js')) {
        assert.ok(
          compiledSource.match(/require\("\.\/baseDir\/isTruthy"\);/g),
          'Correctly rewrites named import'
        )
        done()
      }
    }

    const transformers = {
      before: [importsTransformer(program)],
    }
    const { emitSkipped, diagnostics } = program.emit(undefined, callback, undefined, false, transformers);

    assert.equal(emitSkipped, false, diagnostics.map(diagnostic => diagnostic.messageText).join('\n'))
  })
})
