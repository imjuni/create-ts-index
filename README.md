create-ts-index
----
[![Download Status](https://img.shields.io/npm/dw/create-ts-index.svg)](https://img.shields.io/npm/dw/create-ts-index.svg) [![Github Star](https://img.shields.io/github/stars/imjuni/create-ts-index.svg?style=social)](https://img.shields.io/github/stars/imjuni/create-ts-index.svg?style=social) [![NPM version](https://img.shields.io/npm/v/create-ts-index.svg)](https://img.shields.io/npm/v/create-ts-index.svg) [![License](https://img.shields.io/npm/l/create-ts-index.svg)](https://img.shields.io/npm/l/create-ts-index.svg)


# Install
```
npm install create-ts-index --save-dev
```

# Breaking Changes
`create-ts-index(below cti)` have breaking change on `1.5`. `cti` change to Git-style sub-commands. `cti` convenient tool for Node.js package development. Node.js packages have variety type `commonjs` and `AMD`, `umd`. Almost `AMD`, `umd` packages used to bundle tool likes `webpack` or `parcel`. `1.x` version `cti` have in-connvenient for bundle tools. We need legacy index.ts creation and entrypoint.ts creation. So `cti` adopt Git-style sub-commands after `create` sub-commands

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

create-ts-index create sub-command create index.ts file below.

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

create-ts-index entrypoint sub-command create index.ts file below.

```
  src/
    app.ts
    component/
      Nav.ts
      Button.ts
  > entrypoint.ts
    // created from 'create-ts-index'
    export * from './src/app.ts'
    export * from './src/component/Nav.ts'
    export * from './src/component/Button.ts'
```

# Option
## library
* `fileFirst: boolean` export list create filefirst. default false
* `addNewline: boolean` deside add newline file ending. default true
* `useSemicolon: boolean` deside use semicolon line ending. default true
* `useTimestamp: boolean` deside use timestamp(YYYY-MM-DD HH:mm) top line comment. default false
* `includeCWD: boolean` deside include cwd directory. default true
* `excludes: string[]` pass exclude directory. default exclude directory is `['@types', 'typings', '__test__', '__tests__']`
* `fileExcludePatterns: string[]` pass exclude filename pattern. default exclude patterns is `[]`
* `targetExts: string[]` pass include extname. default extname is `['ts', 'tsx']`. extname pass without dot charactor.
* `globOptions: glob.IOptions` pass include glob options. [node-glob](https://github.com/isaacs/node-glob) option use it.
* `quote` deside quote charactor. Single quete charactor use to default.
* `verbose` verbose log message disply


## cli (use it cti)
* `-f --filefirst` export list create filefirst, no option false, option true
* `-n --addnewline` deside add newline file ending. no option true, option false
* `-s --usesemicolon` deside use semicolon line ending. no option true, option false
* `-t --usetimestamp` deside use timestamp(YYYY-MM-DD HH:mm) top line comment. no option false, option true
* `-c --includecwd` deside include cwd directory. no option true, option true
* `-e --excludes [comma separated exclude directories]` pass exclude directory. default exclude directory is `['@types', 'typings', '__test__', '__tests__']`
* `-i --fileexcludes [comma separated extname]` pass exclude filename pattern. default exclude patterns is `[]`
* `-x --targetexts [comma separated extname]` pass include extname. default extname is `['ts', 'tsx']`. extname pass without dot charactor.
* `-q --quote` deside quote charactor. default quote charactor single quote
* `-v --verbose` disply verbose log message. no option false, option true

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
const tsiw = new TypeScritIndexWriter();
const option = TypeScritIndexWriter.getDefaultOption('./src');

(async () => {
  await tsiw.create(option);

  // or

  await tsiw.createEntrypoint(option);
})();
```

## CLI
```
# basic usage
cti create ./src  # or cti create ./src
## or
cti entrypoint ./src  # or cti create ./src

# without newline

## create sub-command, create sub-command is a default command
cti -n ./src
cti create -n ./src

## entrypoint sub-command
cti entrypoint -n ./src

# custom exclude directories
cti create -n -e @types,typings,__test__,__tests__,pages ./src
## or
cti entrypoint -n -e @types,typings,__test__,__tests__,pages ./src

# clean index.ts
cti clean ./src  # or cti clean ./src

# loop through every sub-directory in current path
for f in *; do cti create ./$f; done

# Pass variadic directories
cti create ./src/server ./src/client ./src/module
```

# Language
* [English](https://github.com/imjuni/create-ts-index/blob/master/README.md)
* [Korean](https://github.com/imjuni/create-ts-index/blob/master/README.ko.md)
