create-ts-index
----

# Install
```
npm install create-ts-index --save-dev
```

# Introduction
Index.ts file create for export syntax. If don't have business logic in index.ts that use to only export. In this case, more than easy importing and library project need this export process(for example, blueprint.js etc ...). cti(create-ts-index) create export index.ts file.

For example, sample directory below.

```
  src/
    app.ts
    component/
      Nav.ts
      Button.ts
```

create-ts-index create index.ts file below.

```
  src/
    app.ts
    > index.ts
      // created from 'create-ts-index'
      export * from './component';
      export * from './app';
    component/
      Nav.ts
      Button.ts
      > index.ts
        // created from 'create-ts-index'
        export * from './Nav';
        export * from './Button';
```

# Option
## library
* `fileFirst?: boolean` export list create filefirst. default false
* `addNewline?: boolean` deside add newline file ending. default true
* `useSemicolon?: boolean` deside use semicolon line ending. default true
* `useTimestamp?: boolean` deside use timestamp(YYYY-MM-DD HH:mm) top line comment. default false
* `includeCWD?: boolean` deside include cwd directory. default true
* `excludes?: string[]` pass exclude directory. default exclude directory is `['@types', 'typings', '__test__', '__tests__']`
* `fileExcludePatterns?: string[]` pass exclude filename pattern. default exclude patterns is `[]`
* `targetExts?: string[]` pass include extname. default extname is `['ts', 'tsx']`. extname pass without dot charactor.
* `globOptions?: glob.IOptions` pass include glob options. [node-glob](https://github.com/isaacs/node-glob) option use it.

## cli (use it cti)
* `-f --filefirst` export list create filefirst, no option false, option true
* `-n --addnewline` deside add newline file ending. no option true, option false
* `-s --usesemicolon` deside use semicolon line ending. no option true, option false
* `-t --usetimestamp` deside use timestamp(YYYY-MM-DD HH:mm) top line comment. no option false, option true
* `-c --includecwd` deside include cwd directory. no option true, option true
* `-e --excludes [comma separated exclude directories]` pass exclude directory. default exclude directory is `['@types', 'typings', '__test__', '__tests__']`
* `-i --fileexcludes [comma separated extname]` pass exclude filename pattern. default exclude patterns is `[]`
* `-x --targetexts [comma separated extname]` pass include extname. default extname is `['ts', 'tsx']`. extname pass without dot charactor.

# Breaking change
I expect `create-ts-index` to be developed in more OOP style. Also I want to add action that clean action
and create webpack entrypoint file action. Finally I want add dependency graph using by TypeScript parser
that help to exactly build index.ts files and entrypoint file.
Painfully, But I had to make a decision. CLI change git-style sub-command. Also library change to class.

## CLI
add git-style sub-command
* create
  * cti create index.ts file
* clean
  * cti clean index.ts file recursively
* entrypoint
  * cti create webpack entrypoint

# Usage
## library
```
const option = {};

option.fileFirst = false;
option.addNewline = true;
option.useSemicolon = true;
option.useTimestamp = false;
option.fileExcludePatterns = [];
option.globOptions.cwd = process.cwd();
option.globOptions.nonull = true;
option.globOptions.dot = true;
option.excludes = ['@types', 'typings', '__test__', '__tests__'];
option.targetExts = ['ts', 'tsx'];

(async () => {
  await createTypeScriptIndex(option);
})();
```

## CLI
```
# basic usage
cti c ./src  # or cti create ./src

# without newline
cti c -n ./src

# custom exclude directories
cti c -n -e @types,typings,__test__,__tests__,pages ./src

# clean index.ts
cti l ./src  # or cti clean ./src
```

# Language
* [English](https://github.com/imjuni/create-ts-index/blob/master/README.md)
* [Korean](https://github.com/imjuni/create-ts-index/blob/master/README.ko.md)
