import { findImportLikeNodes, ImportKind , ImportLike, isLiteralTypeNode, isTextualLiteral } from 'tsutils'
import * as ts from 'typescript'

import * as nodePath from 'path';
import { createMatchPath, MatchPath } from 'tsconfig-paths';

// ugly hack because passing TSCONFIG_PATH_EXTENSIONS to tsconfig-path doens't really work in plain node
// https://github.com/dividab/tsconfig-paths/issues/61
require.extensions['.ts'] = require.extensions['.js']
require.extensions['.tsx'] = require.extensions['.js']
const TSCONFIG_PATH_EXTENSIONS = ['.ts', '.tsx']

// force extra extensions onto matchPath
// this doesn't resolve the supplied extensions, for some reason
// import { fileExistsSync, readJsonFromDiskSync } from 'tsconfig-paths/lib/filesystem';
// const matchPath = (value: string) => matchPathFunc(value, readJsonFromDiskSync, fileExistsSync, TSCONFIG_PATH_EXTENSIONS)

const transform = (program: ts.Program) => transformerFactory

type AssertNever<T extends never> = T;

const transformerFactory: ts.TransformerFactory<ts.SourceFile> = context => {
  const compilerOptions = context.getCompilerOptions()
  const absoluteBaseUrl = compilerOptions.baseUrl && compilerOptions.baseUrl[0] === '/' ? compilerOptions.baseUrl : nodePath.join(process.cwd(), compilerOptions.baseUrl || '.');
  const matchPathFunc = createMatchPath(absoluteBaseUrl, compilerOptions.paths || {});

  return file => visitSourceFile(file, context, matchPathFunc) as ts.SourceFile;
};

function visitSourceFile(sourceFile: ts.SourceFile, context: ts.TransformationContext, matchPathFunc: MatchPath) {
  const sourceFilePath = nodePath.dirname(sourceFile.fileName)

  for (const node of findImportLikeNodes(sourceFile, ImportKind.All)) {
    visitNode(node)
  }

  return sourceFile;

  function visitNode(node: ImportLike) {
    // This is similar to tsutil's findImports, modified for our use case
    // https://github.com/ajafff/tsutils/blob/f14d5ad2edef34dbf38d08d579d7db4c33d2f55d/util/util.ts#L1131
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration:
      case ts.SyntaxKind.ExportDeclaration:
        // node.moduleSpecifier
        if (isTextualLiteral(node.moduleSpecifier) && !isModuleSpecifierRelative(node.moduleSpecifier)) {
          const matchedPath = matchPathFunc(getModuleSpecifierValue(node.moduleSpecifier))
          if (matchedPath) {
            node.moduleSpecifier = createRelativeLiteral(matchedPath)
          }
          return node
        }
        break;
      case ts.SyntaxKind.ImportEqualsDeclaration:
          // node.moduleReference.expression
          if (isTextualLiteral(node.moduleReference.expression) && !isModuleSpecifierRelative(node.moduleReference.expression)) {
            const matchedPath = matchPathFunc(getModuleSpecifierValue(node.moduleReference.expression))
            if (matchedPath) {
              node.moduleReference.expression = createRelativeLiteral(matchedPath)
            }
            return node
          }
          break;
      case ts.SyntaxKind.CallExpression:
          // node.arguments[0]
          if (isTextualLiteral(node.arguments[0]) && !isModuleSpecifierRelative(node.arguments[0])) {
            const matchedPath = matchPathFunc(getModuleSpecifierValue(node.arguments[0]))
            if (matchedPath) {
              node.arguments[0] = createRelativeLiteral(matchedPath)
            }
            return node
          }
          break;
      case ts.SyntaxKind.ImportType:
          // visitNode(node.argument.literal);
          if (isLiteralTypeNode(node.argument)) {
            if (isTextualLiteral(node.argument.literal) && !isModuleSpecifierRelative(node.argument.literal)) {
              const matchedPath = matchPathFunc(getModuleSpecifierValue(node.argument.literal))
              if (matchedPath) {
                node.argument.literal = createRelativeLiteral(matchedPath)
              }
              return node
            }
          }
          break;
      default:
          throw new Error('Unexpected ImportLike node') as AssertNever<typeof node>;
    }
    return node
  }

  function createRelativeLiteral(path: string): ts.StringLiteral {
    const replacePath = nodePath.relative(sourceFilePath, path)
    return ts.createLiteral(isPathRelative(replacePath) ? replacePath : `./${replacePath}`)
  }

  function isModuleSpecifierRelative(moduleSpecifier: ts.Expression) {
    if (moduleSpecifier && moduleSpecifier.getText()) {
      return isPathRelative(moduleSpecifier.getText())
    }
    return false
  }

  function isPathRelative(path: string) {
    return (path.startsWith('./') || path.startsWith('../'))
  }

  function getModuleSpecifierValue(specifier: ts.Expression) {
    // it's hard, so we'll just assume leading width is the length of the trailing width
    const value = specifier.getText().substr(specifier.getLeadingTriviaWidth(), specifier.getWidth() - specifier.getLeadingTriviaWidth() * 2)
    return value
  }
}

export default transform
