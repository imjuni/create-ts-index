#!/usr/bin/env node
// tslint:disable no-console no-string-literal

import * as chalk from 'chalk';
import debug from 'debug';
import * as fs from 'fs';
import * as path from 'path';
import yargs, { Argv, Options } from 'yargs';
import { CleanCommandModule } from './commands/CleanCommandModule';
import { CreateCommandModule } from './commands/CreateCommandModule';
import { EntrypointCommandModule } from './commands/EntrypointCommandModule';
import { InitCommandModule } from './commands/InitCommandModule';
import { EN_CLI_OPTION } from './EN_CLIOPTION';
import {
  cleanOptionBuilder,
  createOptionBuilder,
  entrypointOptionBuilder,
  initOptionBuilder,
} from './options/CreateTsIndexOption';
import { ICreateTsIndexCliOption } from './options/ICreateTsIndexCliOption';
import {
  TCleanCliOption,
  TEntrypointCliOption,
  TInitCliOption,
} from './options/partialCliOption';
import { isNotEmpty } from './tools/CTIUtility';

const log = debug('cti:cti-cli');

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

  return '1.7.2';
})();

const optionMap: { [key in EN_CLI_OPTION]: Options } = {
  [EN_CLI_OPTION.FILEFIRST]: {
    alias: 'f',
    describe: 'export list create filefirst, no option false, option true',
    type: 'boolean',
  },
  [EN_CLI_OPTION.ADD_NEWLINE]: {
    alias: 'n',
    describe: 'deside add newline file ending. no option true, option false',
    type: 'boolean',
  },
  [EN_CLI_OPTION.USE_SEMICOLON]: {
    alias: 's',
    describe: 'deside use semicolon line ending. no option true, option false',
    type: 'boolean',
  },
  [EN_CLI_OPTION.INCLUDE_CWD]: {
    alias: 'c',
    describe: 'deside include cwd directory in task. no option true, option false',
    type: 'boolean',
  },
  [EN_CLI_OPTION.USE_TIMESTAMP]: {
    alias: 't',
    describe: `deside use timestamp(YYYY-MM-DD HH:mm) top line comment. \nno option false, option true`, // tslint:disable-line
    type: 'boolean',
  },
  [EN_CLI_OPTION.EXCLUDES]: {
    alias: 'e',
    array: true,
    describe: `pass exclude directory. default exclude directory is ['@types', 'typings', '__test__', '__tests__']`, // tslint:disable-line
    type: 'string',
  },
  [EN_CLI_OPTION.FILE_EXCLUDES]: {
    alias: 'i',
    array: true,
    describe: 'pass exclude pattern of filename. default exclude directory is "[]"',
    type: 'string',
  },
  [EN_CLI_OPTION.TARGET_EXTS]: {
    alias: 'x',
    array: true,
    describe: `pass include extname. default extname is ["ts", "tsx"]. extname \npass without dot charactor.`, // tslint:disable-line
    type: 'string',
  },
  [EN_CLI_OPTION.VERBOSE]: {
    alias: 'v',
    describe: 'verbose logging message. to option false, option true',
    type: 'boolean',
  },
  [EN_CLI_OPTION.QUOTE]: {
    alias: 'q',
    describe: "deside quote character. default quote character is '",
    type: 'string',
  },
};

const parser = yargs<ICreateTsIndexCliOption>({
  addnewline: true,
  cwds: [],
  excludes: ['@types', 'typings', '__test__', '__tests__', 'node_modules'],
  fileexcludes: [],
  filefirst: false,
  includecwd: true,
  quote: "'",
  targetexts: ['ts', 'tsx'],
  usesemicolon: true,
  usetimestamp: false,
  verbose: false,
})
  .command<ICreateTsIndexCliOption>(
    '$0 [cwds...]',
    'create index.ts file in working directory',
    (args: Argv<ICreateTsIndexCliOption>): Argv<ICreateTsIndexCliOption> => {
      args.option(EN_CLI_OPTION.FILEFIRST, optionMap[EN_CLI_OPTION.FILEFIRST]);
      args.option(EN_CLI_OPTION.ADD_NEWLINE, optionMap[EN_CLI_OPTION.ADD_NEWLINE]);
      args.option(EN_CLI_OPTION.USE_SEMICOLON, optionMap[EN_CLI_OPTION.USE_SEMICOLON]);
      args.option(EN_CLI_OPTION.INCLUDE_CWD, optionMap[EN_CLI_OPTION.INCLUDE_CWD]);
      args.option(EN_CLI_OPTION.USE_TIMESTAMP, optionMap[EN_CLI_OPTION.USE_TIMESTAMP]);
      args.option(EN_CLI_OPTION.EXCLUDES, optionMap[EN_CLI_OPTION.EXCLUDES]);
      args.option(EN_CLI_OPTION.FILE_EXCLUDES, optionMap[EN_CLI_OPTION.FILE_EXCLUDES]);
      args.option(EN_CLI_OPTION.TARGET_EXTS, optionMap[EN_CLI_OPTION.TARGET_EXTS]);
      args.option(EN_CLI_OPTION.VERBOSE, optionMap[EN_CLI_OPTION.VERBOSE]);
      args.option(EN_CLI_OPTION.QUOTE, optionMap[EN_CLI_OPTION.QUOTE]);

      return args;
    },
    async (args: ICreateTsIndexCliOption) => {
      const cwds = args.cwds;
      const cliCwd = process.cwd();

      if (!cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      if (typeof cwds === 'string') {
        const createCommand = new CreateCommandModule();
        const options = createOptionBuilder(args, cwds);

        return createCommand.do(cliCwd, options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const createCommand = new CreateCommandModule();
              const options = createOptionBuilder(args, cwd);
              return createCommand.do(cliCwd, options);
            }),
        );
      }
    },
  )
  .command<ICreateTsIndexCliOption>(
    'create [cwds...]',
    'create index.ts file in working directory',
    (args: Argv<ICreateTsIndexCliOption>): Argv<ICreateTsIndexCliOption> => {
      args.option(EN_CLI_OPTION.FILEFIRST, optionMap[EN_CLI_OPTION.FILEFIRST]);
      args.option(EN_CLI_OPTION.ADD_NEWLINE, optionMap[EN_CLI_OPTION.ADD_NEWLINE]);
      args.option(EN_CLI_OPTION.USE_SEMICOLON, optionMap[EN_CLI_OPTION.USE_SEMICOLON]);
      args.option(EN_CLI_OPTION.INCLUDE_CWD, optionMap[EN_CLI_OPTION.INCLUDE_CWD]);
      args.option(EN_CLI_OPTION.USE_TIMESTAMP, optionMap[EN_CLI_OPTION.USE_TIMESTAMP]);
      args.option(EN_CLI_OPTION.EXCLUDES, optionMap[EN_CLI_OPTION.EXCLUDES]);
      args.option(EN_CLI_OPTION.FILE_EXCLUDES, optionMap[EN_CLI_OPTION.FILE_EXCLUDES]);
      args.option(EN_CLI_OPTION.TARGET_EXTS, optionMap[EN_CLI_OPTION.TARGET_EXTS]);
      args.option(EN_CLI_OPTION.VERBOSE, optionMap[EN_CLI_OPTION.VERBOSE]);
      args.option(EN_CLI_OPTION.QUOTE, optionMap[EN_CLI_OPTION.QUOTE]);

      return args;
    },
    async (args: ICreateTsIndexCliOption) => {
      const cwds = args['cwds'];
      const cliCwd = process.cwd();

      log('cli option: ', args);

      if (!cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      if (typeof cwds === 'string') {
        const createCommand = new CreateCommandModule();
        const options = createOptionBuilder(args, cwds);

        return createCommand.do(cliCwd, options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const createCommand = new CreateCommandModule();
              const options = createOptionBuilder(args, cwd);
              return createCommand.do(cliCwd, options);
            }),
        );
      }
    },
  )
  .command<TEntrypointCliOption>(
    'entrypoint [cwds...]',
    'create entrypoint.ts file in working directory',
    (args: Argv<ICreateTsIndexCliOption>): Argv<TEntrypointCliOption> => {
      args.option(EN_CLI_OPTION.ADD_NEWLINE, optionMap[EN_CLI_OPTION.ADD_NEWLINE]);
      args.option(EN_CLI_OPTION.USE_SEMICOLON, optionMap[EN_CLI_OPTION.USE_SEMICOLON]);
      args.option(EN_CLI_OPTION.INCLUDE_CWD, optionMap[EN_CLI_OPTION.INCLUDE_CWD]);
      args.option(EN_CLI_OPTION.USE_TIMESTAMP, optionMap[EN_CLI_OPTION.USE_TIMESTAMP]);
      args.option(EN_CLI_OPTION.EXCLUDES, optionMap[EN_CLI_OPTION.EXCLUDES]);
      args.option(EN_CLI_OPTION.FILE_EXCLUDES, optionMap[EN_CLI_OPTION.FILE_EXCLUDES]);
      args.option(EN_CLI_OPTION.TARGET_EXTS, optionMap[EN_CLI_OPTION.TARGET_EXTS]);
      args.option(EN_CLI_OPTION.VERBOSE, optionMap[EN_CLI_OPTION.VERBOSE]);
      args.option(EN_CLI_OPTION.QUOTE, optionMap[EN_CLI_OPTION.QUOTE]);

      return args;
    },
    async (args: TEntrypointCliOption) => {
      const cwds = args.cwds;
      const cliCwd = process.cwd();

      if (!cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      if (typeof cwds === 'string') {
        const entrypointCommand = new EntrypointCommandModule();
        const options = entrypointOptionBuilder(args, cwds);

        return entrypointCommand.do(cliCwd, options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const entrypointCommand = new EntrypointCommandModule();
              const options = entrypointOptionBuilder(args, cwd);
              return entrypointCommand.do(cliCwd, options);
            }),
        );
      }
    },
  )
  .command<TInitCliOption>(
    'init [cwds...]',
    'create .ctirc file in working directory',
    (args: Argv<ICreateTsIndexCliOption>): Argv<TInitCliOption> => {
      args.option(EN_CLI_OPTION.ADD_NEWLINE, optionMap[EN_CLI_OPTION.ADD_NEWLINE]);
      args.option(EN_CLI_OPTION.USE_TIMESTAMP, optionMap[EN_CLI_OPTION.USE_TIMESTAMP]);
      args.option(EN_CLI_OPTION.VERBOSE, optionMap[EN_CLI_OPTION.VERBOSE]);

      return args;
    },
    async (args: TInitCliOption) => {
      const cwds = isNotEmpty(args.cwds) ? args.cwds : [process.cwd()];
      const cliCwd = process.cwd();

      log('init command start, ', cwds);

      if (typeof cwds === 'string') {
        const initCommandModule = new InitCommandModule();
        const options = initOptionBuilder(args as any, cwds);

        return initCommandModule.do(cliCwd, options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const initCommandModule = new InitCommandModule();
              const options = initOptionBuilder(args as any, cwd);

              return initCommandModule.do(cliCwd, options);
            }),
        );
      }
    },
  )
  .command<TCleanCliOption>(
    'clean [cwds...]',
    'clean index.ts or entrypoint.ts file in working directory',
    (args: Argv<any>): Argv<TCleanCliOption> => {
      args.option(EN_CLI_OPTION.VERBOSE, optionMap[EN_CLI_OPTION.VERBOSE]);
      return args;
    },
    async (args: TCleanCliOption) => {
      const cwds = args['cwds'];
      const cliCwd = process.cwd();

      if (!cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      if (typeof cwds === 'string') {
        const cleanCommand = new CleanCommandModule();
        const options = cleanOptionBuilder(args as any, cwds);

        await cleanCommand.do(cliCwd, options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const cleanCommand = new CleanCommandModule();
              const options = cleanOptionBuilder(args as any, cwd);
              return cleanCommand.do(cliCwd, options);
            }),
        );
      }
    },
  )
  .version(version, 'version', 'display version information')
  .help();

// tslint:disable-next-line
parser.argv;
