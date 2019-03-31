#!/usr/bin/env node
// tslint:disable no-console no-string-literal

import * as chalk from 'chalk';
import debug from 'debug';
import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { CleanCommandModule } from './commands/CleanCommandModule';
import { CreateCommandModule } from './commands/CreateCommandModule';
import { EntrypointCommandModule } from './commands/EntrypointCommandModule';
import { InitCommandModule } from './commands/InitCommandModule';
import { EN_CLI_OPTION } from './EN_CLIOPTION';
import { CreateTsIndexOption } from './options/CreateTsIndexOption';
import { ICreateTsIndexCliOption } from './options/ICreateTsIndexOption';
import { CTIUtility } from './tools/CTIUtility';

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

const predefinedOptionMap: { [key in EN_CLI_OPTION]: yargs.Options } = (() => {
  const _predefinedOptionMap: { [key in EN_CLI_OPTION]: yargs.Options } = {} as any;

  _predefinedOptionMap[EN_CLI_OPTION.ADD_NEWLINE] = {
    alias: 'f',
    describe: 'export list create filefirst, no option false, option true',
    type: 'boolean',
  };

  _predefinedOptionMap[EN_CLI_OPTION.ADD_NEWLINE] = {
    alias: 'n',
    describe: 'deside add newline file ending. no option true, option false',
    type: 'boolean',
  };

  _predefinedOptionMap[EN_CLI_OPTION.USE_SEMICOLON] = {
    alias: 's',
    describe: 'deside use semicolon line ending. no option true, option false',
    type: 'boolean',
  };

  _predefinedOptionMap[EN_CLI_OPTION.INCLUDE_CWD] = {
    alias: 'c',
    describe: 'deside include cwd directory in task. no option true, option false',
    type: 'boolean',
  };

  _predefinedOptionMap[EN_CLI_OPTION.USE_TIMESTAMP] = {
    alias: 't',
    describe: `deside use timestamp(YYYY-MM-DD HH:mm) top line comment.
no option false, option true`,
    type: 'boolean',
  };
  _predefinedOptionMap[EN_CLI_OPTION.EXCLUDES] = {
    alias: 'e',
    array: true,
    describe: `pass exclude directory. default exclude directory is
['@types', 'typings', '__test__', '__tests__']`,
    type: 'string',
  };

  _predefinedOptionMap[EN_CLI_OPTION.FILE_EXCLUDES] = {
    alias: 'i',
    array: true,
    describe: 'pass exclude pattern of filename. default exclude directory is "[]"',
    type: 'string',
  };

  _predefinedOptionMap[EN_CLI_OPTION.TARGET_EXTS] = {
    alias: 'x',
    array: true,
    describe: `pass include extname. default extname is ["ts", "tsx"]. extname
pass without dot charactor.`,
    type: 'string',
  };

  _predefinedOptionMap[EN_CLI_OPTION.VERBOSE] = {
    alias: 'v',
    describe: 'verbose logging message. to option false, option true',
    type: 'boolean',
  };

  _predefinedOptionMap[EN_CLI_OPTION.QUOTE] = {
    alias: 'q',
    describe: "deside quote character. default quote character is '",
    type: 'string',
  };

  return _predefinedOptionMap;
})();

function yargOptionBuilder<T>(
  args: yargs.Argv<T>,
  optionKeys: Array<EN_CLI_OPTION>,
): yargs.Argv<T> {
  const buildedArgs = args;

  const optionConfigured = optionKeys.reduce((builded: yargs.Argv<T>, optionKey: string) => {
    if (CTIUtility.isNotEmpty(predefinedOptionMap[optionKey])) {
      return builded.option(optionKey, predefinedOptionMap[optionKey]);
    }

    return builded;
  }, buildedArgs);

  return optionConfigured;
}

export function yargOptionBuilder2(args: yargs.Argv<any>): yargs.Argv<any> {
  return args
    .option('filefirst', {
      alias: 'f',
      describe: 'export list create filefirst, no option false, option true',
      type: 'boolean',
    })
    .option('addnewline', {
      alias: 'n',
      describe: 'deside add newline file ending. no option true, option false',
      type: 'boolean',
    })
    .option('usesemicolon', {
      alias: 's',
      describe: 'deside use semicolon line ending. no option true, option false',
      type: 'boolean',
    })
    .option('includecwd', {
      alias: 'c',
      describe: 'deside include cwd directory in task. no option true, option false',
      type: 'boolean',
    })
    .option('usetimestamp', {
      alias: 't',
      describe: `deside use timestamp(YYYY-MM-DD HH:mm) top line comment.
no option false, option true`,
      type: 'boolean',
    })
    .option('excludes', {
      alias: 'e',
      array: true,
      describe: `pass exclude directory. default exclude directory is
['@types', 'typings', '__test__', '__tests__']`,
      type: 'string',
    })
    .option('fileexcludes', {
      alias: 'i',
      array: true,
      describe: 'pass exclude pattern of filename. default exclude directory is "[]"',
      type: 'string',
    })
    .option('targetexts', {
      alias: 'x',
      array: true,
      describe: `pass include extname. default extname is ["ts", "tsx"]. extname
pass without dot charactor.`,
      type: 'string',
    })
    .option('verbose', {
      alias: 'v',
      describe: 'verbose logging message. to option false, option true',
      type: 'boolean',
    })
    .option('quote', {
      alias: 'q',
      describe: "deside quote character. default quote character is '",
      type: 'string',
    });
}

yargs
  .command<ICreateTsIndexCliOption>(
    '$0 [cwds...]',
    'create index.ts file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> =>
      yargOptionBuilder(args, [
        EN_CLI_OPTION.FILEFIRST,
        EN_CLI_OPTION.ADD_NEWLINE,
        EN_CLI_OPTION.USE_SEMICOLON,
        EN_CLI_OPTION.INCLUDE_CWD,
        EN_CLI_OPTION.USE_TIMESTAMP,
        EN_CLI_OPTION.EXCLUDES,
        EN_CLI_OPTION.FILE_EXCLUDES,
        EN_CLI_OPTION.TARGET_EXTS,
        EN_CLI_OPTION.VERBOSE,
        EN_CLI_OPTION.QUOTE,
      ]),
    async (args: ICreateTsIndexCliOption) => {
      const cwds = args['cwds'];
      const cliCwd = process.cwd();

      if (!cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      if (typeof cwds === 'string') {
        const createCommand = new CreateCommandModule();
        const options = CreateTsIndexOption.cliOptionBuilder(args, cwds);

        return createCommand.do(cliCwd, options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const createCommand = new CreateCommandModule();
              const options = CreateTsIndexOption.cliOptionBuilder(args, cwd);
              return createCommand.do(cliCwd, options);
            }),
        );
      }
    },
  )
  .command<ICreateTsIndexCliOption>(
    'create [cwds...]',
    'create index.ts file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> =>
      yargOptionBuilder(args, [
        EN_CLI_OPTION.FILEFIRST,
        EN_CLI_OPTION.ADD_NEWLINE,
        EN_CLI_OPTION.USE_SEMICOLON,
        EN_CLI_OPTION.INCLUDE_CWD,
        EN_CLI_OPTION.USE_TIMESTAMP,
        EN_CLI_OPTION.EXCLUDES,
        EN_CLI_OPTION.FILE_EXCLUDES,
        EN_CLI_OPTION.TARGET_EXTS,
        EN_CLI_OPTION.VERBOSE,
        EN_CLI_OPTION.QUOTE,
      ]),
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
        const options = CreateTsIndexOption.cliOptionBuilder(args, cwds);

        return createCommand.do(cliCwd, options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const createCommand = new CreateCommandModule();
              const options = CreateTsIndexOption.cliOptionBuilder(args, cwd);
              return createCommand.do(cliCwd, options);
            }),
        );
      }
    },
  )
  .command<ICreateTsIndexCliOption>(
    'entrypoint [cwds...]',
    'create entrypoint.ts file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> =>
      yargOptionBuilder(args, [
        EN_CLI_OPTION.FILEFIRST,
        EN_CLI_OPTION.ADD_NEWLINE,
        EN_CLI_OPTION.USE_SEMICOLON,
        EN_CLI_OPTION.INCLUDE_CWD,
        EN_CLI_OPTION.USE_TIMESTAMP,
        EN_CLI_OPTION.EXCLUDES,
        EN_CLI_OPTION.FILE_EXCLUDES,
        EN_CLI_OPTION.TARGET_EXTS,
        EN_CLI_OPTION.VERBOSE,
        EN_CLI_OPTION.QUOTE,
      ]),
    async (args: ICreateTsIndexCliOption) => {
      const cwds = args['cwds'];
      const cliCwd = process.cwd();

      if (!cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      if (typeof cwds === 'string') {
        const entrypointCommand = new EntrypointCommandModule();
        const options = CreateTsIndexOption.cliOptionBuilder(args, cwds);

        return entrypointCommand.do(cliCwd, options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const entrypointCommand = new EntrypointCommandModule();
              const options = CreateTsIndexOption.cliOptionBuilder(args, cwd);
              return entrypointCommand.do(cliCwd, options);
            }),
        );
      }
    },
  )
  .command<ICreateTsIndexCliOption>(
    'init [cwds...]',
    'create .ctirc file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> =>
      yargOptionBuilder(args, [
        EN_CLI_OPTION.ADD_NEWLINE,
        EN_CLI_OPTION.USE_TIMESTAMP,
        EN_CLI_OPTION.VERBOSE,
      ]),
    async (args: ICreateTsIndexCliOption) => {
      const cwds = (() => {
        const argsCwd = args['cwds'];

        if (CTIUtility.isNotEmpty(argsCwd)) {
          return argsCwd;
        }

        return [process.cwd()];
      })();

      log('init command start, ', cwds);

      const cliCwd = process.cwd();

      if (typeof cwds === 'string') {
        const initCommandModule = new InitCommandModule();
        const options = CreateTsIndexOption.cliOptionBuilder(args, cwds);

        return initCommandModule.do(cliCwd, options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const initCommandModule = new InitCommandModule();
              const options = CreateTsIndexOption.cliOptionBuilder(args, cwd);

              return initCommandModule.do(cliCwd, options);
            }),
        );
      }
    },
  )
  .command(
    'clean [cwds...]',
    'clean index.ts or entrypoint.ts file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> =>
      yargOptionBuilder(args, [EN_CLI_OPTION.VERBOSE]),
    async (args: ICreateTsIndexCliOption) => {
      const cwds = args['cwds'];
      const cliCwd = process.cwd();

      if (!cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      if (typeof cwds === 'string') {
        const cleanCommand = new CleanCommandModule();
        const options = CreateTsIndexOption.cliOptionBuilder(args, cwds);

        await cleanCommand.do(cliCwd, options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const cleanCommand = new CleanCommandModule();
              const options = CreateTsIndexOption.cliOptionBuilder(args, cwd);
              return cleanCommand.do(cliCwd, options);
            }),
        );
      }
    },
  )
  .version(version, 'version', 'display version information')
  .help();

// tslint:disable-next-line
yargs.argv;
