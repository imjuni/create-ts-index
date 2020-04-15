import * as chalk from 'chalk';
import debug from 'debug';
import * as fs from 'fs';
import yargs, { Arguments, Argv } from 'yargs';
import { CleanCommandModule } from './commands/CleanCommandModule';
import { CreateCommandModule } from './commands/CreateCommandModule';
import { EntrypointCommandModule } from './commands/EntrypointCommandModule';
import { InitCommandModule } from './commands/InitCommandModule';
import { createFromCli } from './options/configure';
import { ICreateTsIndexCliOption } from './options/ICreateTsIndexCliOption';
import { options } from './options/options';

const log = debug('cti:cti-cli');
const version = '1.10.2';

function setter(name: keyof ICreateTsIndexCliOption, yargv: Argv<{}>) {
  const option = options.get(name);

  if (option !== undefined && option !== null) {
    yargv.option(name, option);
  }
}

const argv = yargs
  .command<ICreateTsIndexCliOption>({
    aliases: '$0 [cwds...]',
    builder: (args: Argv<{}>) => {
      setter('filefirst', args);
      setter('addnewline', args);
      setter('usesemicolon', args);
      setter('includecwd', args);
      setter('usetimestamp', args);
      setter('excludes', args);
      setter('fileexcludes', args);
      setter('targetexts', args);
      setter('verbose', args);
      setter('quote', args);
      setter('withoutcomment', args);
      setter('withoutbackup', args);
      setter('output', args);

      const anyArgs: any = args;
      return anyArgs;
    },
    command: 'create [cwds...]',
    describe: 'create index.ts file in working directory',
    handler: async (args: Arguments<ICreateTsIndexCliOption>) => {
      const workingDir = process.cwd();

      if (!args.cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      const targetDirs = Array.isArray(args.cwds) ? args.cwds : [args.cwds];

      await Promise.all(
        targetDirs
          .filter((cwd) => fs.existsSync(cwd))
          .map((cwd) => {
            const createCommand = new CreateCommandModule();
            const optionsFromCli = createFromCli(args, cwd);
            return createCommand.do(workingDir, optionsFromCli);
          }),
      );
    },
  })
  .command<ICreateTsIndexCliOption>({
    builder: (args: Argv<{}>) => {
      setter('addnewline', args);
      setter('usesemicolon', args);
      setter('includecwd', args);
      setter('usetimestamp', args);
      setter('excludes', args);
      setter('fileexcludes', args);
      setter('targetexts', args);
      setter('verbose', args);
      setter('quote', args);
      setter('withoutcomment', args);
      setter('withoutbackup', args);
      setter('output', args);

      const anyArgs: any = args;
      return anyArgs;
    },
    command: 'entrypoint [cwds...]',
    describe: 'create entrypoint.ts file in working directory',
    handler: async (args: ICreateTsIndexCliOption) => {
      const workingDir = process.cwd();

      if (!args.cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      const targetDirs = Array.isArray(args.cwds) ? args.cwds : [args.cwds];

      await Promise.all(
        targetDirs
          .filter((cwd) => fs.existsSync(cwd))
          .map((cwd) => {
            const entrypointCommand = new EntrypointCommandModule();
            const optionsFromCli = createFromCli(args, cwd, 'entrypoint.ts');
            return entrypointCommand.do(workingDir, optionsFromCli);
          }),
      );
    },
  })
  .command<ICreateTsIndexCliOption>({
    builder: (args: yargs.Argv<{}>) => {
      setter('addnewline', args);
      setter('usetimestamp', args);
      setter('verbose', args);

      const anyArgs: any = args;
      return anyArgs;
    },
    command: 'init [cwds...]',
    describe: 'create .ctirc file in working directory',
    handler: async (args: ICreateTsIndexCliOption) => {
      const workingDir = process.cwd();

      if (!args.cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));

        process.exit(1);
      }

      const targetDirs = Array.isArray(args.cwds) ? args.cwds : [args.cwds];

      await Promise.all(
        targetDirs
          .filter((cwd) => fs.existsSync(cwd))
          .map((cwd) => {
            const initCommandModule = new InitCommandModule();
            const optionsFromCli = createFromCli(args, cwd);
            return initCommandModule.do(workingDir, optionsFromCli);
          }),
      );
    },
  })
  .command<ICreateTsIndexCliOption>({
    builder: (args: Argv<any>): Argv<ICreateTsIndexCliOption> => {
      setter('verbose', args);
      setter('output', args);
      const anyArgs: any = args;
      return anyArgs;
    },
    command: 'clean [cwds...]',
    describe: 'clean index.ts or entrypoint.ts file in working directory',
    handler: async (args: ICreateTsIndexCliOption) => {
      const workDir = process.cwd();

      if (!args.cwds) {
        console.log(chalk.default.magenta('Enter working directory, '));
        console.log(chalk.default.red('cti [working directory]'));
        process.exit(1);
      }

      const targetDirs = Array.isArray(args.cwds) ? args.cwds : [args.cwds];

      await Promise.all(
        targetDirs
          .filter((cwd) => fs.existsSync(cwd))
          .map((cwd) => {
            const cleanCommand = new CleanCommandModule();
            const optionsFromCli = createFromCli(args, cwd);
            return cleanCommand.do(workDir, optionsFromCli);
          }),
      );
    },
  })
  .version(version, 'version', 'display version information')
  .help().argv;

log('output filename: ', argv.output);
