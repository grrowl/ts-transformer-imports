import * as ts from 'typescript'

import * as nodePath from 'path';
import * as tsconfig from 'tsconfig-extends';
import { createMatchPath } from 'tsconfig-paths';

// use `tsconfig-extends` module cause it can recursively apply "extends" field
const compilerOptions = tsconfig.load_file_sync('./tsconfig.json');

// ugly hack because passing TSCONFIG_PATH_EXTENSIONS to tsconfig-path doens't really work?
require.extensions['.ts'] = require.extensions['.js']
require.extensions['.tsx'] = require.extensions['.js']
const TSCONFIG_PATH_EXTENSIONS = ['.ts', '.tsx']

const absoluteBaseUrl = nodePath.join(process.cwd(), compilerOptions.baseUrl || '.');
const matchPathFunc = createMatchPath(absoluteBaseUrl, compilerOptions.paths || {});
// force extra extensions onto matchPath
// this doesn't resolve the supplied extensions, for some reason
// import { fileExistsSync, readJsonFromDiskSync } from 'tsconfig-paths/lib/filesystem';
// const matchPath = (value: string) => matchPathFunc(value, readJsonFromDiskSync, fileExistsSync, TSCONFIG_PATH_EXTENSIONS)

const transform = (program: ts.Program) => transformerFactory

const transformerFactory: ts.TransformerFactory<ts.SourceFile> = context => {
  return file => visitSourceFile(file, context) as ts.SourceFile;
};

type ImportExportNode = ts.ExportDeclaration | ts.ImportDeclaration

function visitSourceFile(sourceFile: ts.SourceFile, context: ts.TransformationContext) {
  return visitNodeAndChildren(sourceFile);

  function visitNodeAndChildren(node: ts.Node): ts.Node {
    if (node == null) {
      return node;
    }

    node = visitNode(node);

    return ts.visitEachChild(node, childNode => visitNodeAndChildren(childNode), context);
  }

  function visitNode(node: ts.Node) {
    if (ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) {
      return visitImportExportNode(node)
    }
    return node;
  }

  function visitImportExportNode(node: ImportExportNode) {
    if (!node.moduleSpecifier || isImportExportSpecifierRelative(node)) {
      return node
    }

    // const sourceFilePath = sourceFile.fileName
    const sourceFilePath = nodePath.dirname(sourceFile.fileName)
    return relativizeImportExportNode(node, sourceFilePath)
  }

  function isImportExportSpecifierRelative(node: ImportExportNode) {
    if (node.moduleSpecifier) {
      return isPathRelative(getModuleSpecifierValue(node.moduleSpecifier))
    }
    return false
  }

  function getModuleSpecifierValue(specifier: ts.Expression) {
    // it's hard, so we'll just assume leading width is the length of the trailing width
    const value = specifier.getText().substr(specifier.getLeadingTriviaWidth(), specifier.getWidth() - specifier.getLeadingTriviaWidth() * 2)
    return value
  }

  function isPathRelative(path: string) {
    return (path.startsWith('./') || path.startsWith('../'))
  }

  function relativizeImportExportNode(node: ImportExportNode, sourceFilePath: string) {
    if (!node.moduleSpecifier) {
      return node
    }

    const specifierValue = getModuleSpecifierValue(node.moduleSpecifier)
    const matchedPath = matchPathFunc(specifierValue)

    if (matchedPath) {
      const replacePath = nodePath.relative(sourceFilePath, matchedPath)
      // replace the module specifier
      node.moduleSpecifier = ts.createLiteral(isPathRelative(replacePath) ? replacePath : `./${replacePath}`)
    }

    return node
  }
}

export default transform
