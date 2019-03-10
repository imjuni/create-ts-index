#!/usr/bin/env node
// tslint:disable no-console no-string-literal

import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { CleanCommandModule } from './commands/CleanCommandModule';
import { CreateCommandModule } from './commands/CreateCommandModule';
import { EntrypointCommandModule } from './commands/EntrypointCommandModule';
import { CreateTsIndexOption } from './options/CreateTsIndexOption';
import { ICreateTsIndexCliOption } from './options/ICreateTsIndexOption';

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

yargs
  .command<ICreateTsIndexCliOption>(
    '$0 [cwds...]',
    'create index.ts file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> => yargOptionBuilder(args),
    async (args: ICreateTsIndexCliOption) => {
      const cwds = args['cwds'];

      if (!cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      if (typeof cwds === 'string') {
        const createCommand = new CreateCommandModule();
        const options = CreateTsIndexOption.cliOptionBuilder(args, cwds);

        return createCommand.do(options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const createCommand = new CreateCommandModule();
              const options = CreateTsIndexOption.cliOptionBuilder(args, cwd);
              return createCommand.do(options);
            }),
        );
      }
    },
  )
  .command<ICreateTsIndexCliOption>(
    'create [cwds...]',
    'create index.ts file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> => yargOptionBuilder(args),
    async (args: ICreateTsIndexCliOption) => {
      const cwds = args['cwds'];

      if (!cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      if (typeof cwds === 'string') {
        const createCommand = new CreateCommandModule();
        const options = CreateTsIndexOption.cliOptionBuilder(args, cwds);

        return createCommand.do(options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const createCommand = new CreateCommandModule();
              const options = CreateTsIndexOption.cliOptionBuilder(args, cwd);
              return createCommand.do(options);
            }),
        );
      }
    },
  )
  .command<ICreateTsIndexCliOption>(
    'entrypoint [cwds...]',
    'create entrypoint.ts file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> => yargOptionBuilder(args),
    async (args: ICreateTsIndexCliOption) => {
      const cwds = args['cwds'];

      if (!cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      if (typeof cwds === 'string') {
        const entrypointCommand = new EntrypointCommandModule();
        const options = CreateTsIndexOption.cliOptionBuilder(args, cwds);

        entrypointCommand.do(options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const entrypointCommand = new EntrypointCommandModule();
              const options = CreateTsIndexOption.cliOptionBuilder(args, cwd);
              return entrypointCommand.do(options);
            }),
        );
      }
    },
  )
  .command(
    'clean [cwds...]',
    'clean index.ts or entrypoint.ts file in working directory',
    (args: yargs.Argv<any>): yargs.Argv<any> => yargOptionBuilder(args),
    async (args: ICreateTsIndexCliOption) => {
      const cwds = args['cwds'];

      if (!cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      if (typeof cwds === 'string') {
        const cleanCommand = new CleanCommandModule();
        const options = CreateTsIndexOption.cliOptionBuilder(args, cwds);

        await cleanCommand.do(options);
      }

      if (typeof cwds !== 'string' && Array.isArray(cwds)) {
        return Promise.all(
          cwds
            .filter((cwd) => fs.existsSync(cwd))
            .map((cwd) => {
              const cleanCommand = new CleanCommandModule();
              const options = CreateTsIndexOption.cliOptionBuilder(args, cwd);
              return cleanCommand.do(options);
            }),
        );
      }
    },
  )
  .version(version, 'version', 'display version information')
  .help();

// tslint:disable-next-line
yargs.argv;
