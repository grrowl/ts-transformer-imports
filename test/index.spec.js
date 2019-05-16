const assert = require('assert')

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

    assert.strictEqual(emitSkipped, false, diagnostics.map(diagnostic => diagnostic.messageText).join('\n'))
  })

  it('should transform named import in decalration', (done) => {
    const callback = (filename, compiledSource) => {
      if (filename.endsWith('named-base.d.ts')) {
        console.log('>>>', filename, '\n', compiledSource)
        assert.ok(
          compiledSource.match(/require\("\.\/baseDir\/isTruthy"\);/g),
          'Correctly rewrites named import in declaration'
        )
        done()
      }
    }

    const transformers = {
      before: [importsTransformer(program)],
    }
    const { emitSkipped, diagnostics } = program.emit(undefined, callback, undefined, false, transformers);

    assert.strictEqual(emitSkipped, false, diagnostics.map(diagnostic => diagnostic.messageText).join('\n'))
  })
})


describe('Resolves path', () => {
  const COMPILE_OPTIONS = {
    "strict": true,
    "noEmitOnError": true,
    "baseUrl": "test",
    "paths": {
      "aliased-path/*": ["baseDir/*"]
    },
    "declaration": true
  }
  const FILE = path.resolve(__dirname, 'aliased-path.ts')
  const program = ts.createProgram([FILE], COMPILE_OPTIONS);

  it('should transform named import', (done) => {
    const callback = (filename, compiledSource) => {
      if (filename.endsWith('aliased-path.js')) {
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

    assert.strictEqual(emitSkipped, false, diagnostics.map(diagnostic => diagnostic.messageText).join('\n'))
  })

  it('should transform named import in declaration', (done) => {
    const callback = (filename, compiledSource) => {
      if (filename.endsWith('aliased-path.d.ts')) {
        console.log('>>>', filename, '\n', compiledSource)
        assert.ok(
          compiledSource.match(/require\("\.\/baseDir\/isTruthy"\);/g),
          'Correctly rewrites named import in declaration'
        )
        done()
      }
    }

    const transformers = {
      before: [importsTransformer(program)],
    }
    const { emitSkipped, diagnostics } = program.emit(undefined, callback, undefined, false, transformers);

    assert.strictEqual(emitSkipped, false, diagnostics.map(diagnostic => diagnostic.messageText).join('\n'))
  })
})

describe('Resolves multiple paths', () => {
  const COMPILE_OPTIONS = {
    "strict": true,
    "noEmitOnError": true,
    "baseUrl": "test",
    "paths": {
      "aliased-path/*": ["path-1/*", "baseDir/*"]
    },
    "declaration": true
  }
  const FILE = path.resolve(__dirname, 'aliased-path.ts')
  const program = ts.createProgram([FILE], COMPILE_OPTIONS);

  it('should transform named import', (done) => {
    const callback = (filename, compiledSource) => {
      if (filename.endsWith('aliased-path.js')) {
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

    assert.strictEqual(emitSkipped, false, diagnostics.map(diagnostic => diagnostic.messageText).join('\n'))
  })

  it('should transform named import in decalration', (done) => {
    const callback = (filename, compiledSource) => {
      if (filename.endsWith('aliased-path.d.ts')) {
        console.log('>>>', filename, '\n', compiledSource)
        assert.ok(
          compiledSource.match(/require\("\.\/baseDir\/isTruthy"\);/g),
          'Correctly rewrites named import in decalration'
        )
        done()
      }
    }

    const transformers = {
      before: [importsTransformer(program)],
    }
    const { emitSkipped, diagnostics } = program.emit(undefined, callback, undefined, false, transformers);

    assert.strictEqual(emitSkipped, false, diagnostics.map(diagnostic => diagnostic.messageText).join('\n'))
  })
})
