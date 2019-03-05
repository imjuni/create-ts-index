#!/usr/bin/env node
// tslint:disable no-console no-string-literal

import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { ICreateTsIndexCliOption, ICreateTsIndexOption } from './ICreateTsIndexOption';
import { TypeScritIndexWriter } from './TypeScritIndexWriter';

const version = (() => {
  if (fs.existsSync(path.join(__dirname, 'package.json'))) {
    const packageJSON = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'package.json')).toString(),
    );

    return packageJSON.version;
  }

  if (fs.existsSync(path.join('.', 'package.json'))) {
    const packageJSON = JSON.parse(fs.readFileSync(path.join('.', 'package.json')).toString());

    return packageJSON.version;
  }

  return '1.0.14';
})();

function yargOptionBuilder(args: yargs.Argv<any>): yargs.Argv<any> {
  return args
    .option('filefirst', {
      alias: 'f',
      default: false,
      describe: 'export list create filefirst, no option false, option true',
      type: 'boolean',
    })
    .option('addnewline', {
      alias: 'n',
      default: true,
      describe: 'deside add newline file ending. no option true, option false',
      type: 'boolean',
    })
    .option('usesemicolon', {
      alias: 's',
      default: true,
      describe: 'deside use semicolon line ending. no option true, option false',
      type: 'boolean',
    })
    .option('includecwd', {
      alias: 'c',
      default: true,
      describe: 'deside include cwd directory in task. no option true, option false',
      type: 'boolean',
    })
    .option('usetimestamp', {
      alias: 't',
      default: false,
      describe: `deside use timestamp(YYYY-MM-DD HH:mm) top line comment.
no option false, option true`,
      type: 'boolean',
    })
    .option('excludes', {
      alias: 'e',
      array: true,
      default: ['@types', 'typings', '__test__', '__tests__', 'node_modules'],
      describe: `pass exclude directory. default exclude directory is
['@types', 'typings', '__test__', '__tests__']`,
      type: 'string',
    })
    .option('fileexcludes', {
      alias: 'i',
      array: true,
      default: [],
      describe: 'pass exclude pattern of filename. default exclude directory is "[]"',
      type: 'string',
    })
    .option('targetexts', {
      alias: 'x',
      array: true,
      default: ['ts', 'tsx'],
      describe: `pass include extname. default extname is ["ts", "tsx"]. extname
pass without dot charactor.`,
      type: 'string',
    })
    .option('verbose', {
      alias: 'v',
      default: false,
      describe: 'verbose logging message. to option false, option true',
      type: 'boolean',
    })
    .option('quote', {
      alias: 'q',
      default: "'",
      describe: "deside quote character. default quote character is '",
      type: 'string',
    });
}

function ctiOptionBuilder(args: ICreateTsIndexCliOption, cwd: string): ICreateTsIndexOption {
  const options: ICreateTsIndexOption = {
    addNewline: args.addnewline,
    excludes: args.excludes,
    fileExcludePatterns: args.fileexcludes,
    fileFirst: args.filefirst,
    globOptions: {
      cwd,
    },
    includeCWD: args.includecwd,
    quote: args.quote,
    targetExts: args.targetexts,
    useSemicolon: args.usesemicolon,
    useTimestamp: args.usetimestamp,
    verbose: args.verbose,
  };

  return options;
}

yargs
  .command<ICreateTsIndexCliOption>(
    'create <cwd>',
    'create index.ts file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> => yargOptionBuilder(args),
    (args: ICreateTsIndexCliOption) => {
      const cwd = args['cwd'];

      if (!cwd) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      (async () => {
        const cti = new TypeScritIndexWriter();
        const options = ctiOptionBuilder(args, cwd);

        await cti.create(options);
      })();
    },
  )
  .command<ICreateTsIndexCliOption>(
    'entrypoint <cwd>',
    'create entrypoint.ts file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> => yargOptionBuilder(args),
    (args: ICreateTsIndexCliOption) => {
      const cwd = args['cwd'];

      if (!cwd) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      (async () => {
        const cti = new TypeScritIndexWriter();
        const options = ctiOptionBuilder(args, cwd);

        await cti.createEntrypoint(options);
      })();
    },
  )
  .command(
    'clean [cwd]',
    'clean index.ts or entrypoint.ts file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> => yargOptionBuilder(args),
    (args: ICreateTsIndexCliOption) => {
      const cwd = args['cwd'];

      if (!cwd) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      (async () => {
        const cti = new TypeScritIndexWriter();
        const options = ctiOptionBuilder(args, cwd);
        await cti.clean(options);
      })();
    },
  )
  .version(version, 'version', 'display version information')
  .help();

// tslint:disable-next-line
yargs.argv;
