#!/usr/bin/env node
// tslint:disable no-console no-string-literal

import * as chalk from 'chalk';
import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { ICreateTsIndexOption } from './ICreateTsIndexOption';
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

// -f -n -s -t -e -x -i -c -v -q
commander
  .version(version)
  .option('-f --filefirst', 'export list create filefirst, no option false, option true')
  .option('-n --addnewline', 'deside add newline file ending. no option true, option false')
  .option(
    '-s --usesemicolon',
    'deside use semicolon line ending. no option true, option false',
  )
  .option(
    '-c --includecwd',
    'deside include cwd directory in task. no option true, option false',
  )
  .option(
    '-t --usetimestamp',
    'deside use timestamp(YYYY-MM-DD HH:mm) top line comment. no option false, option true',
  )
  .option(
    '-e --excludes <list>',
    'pass exclude directory. default exclude directory is' +
      " `['@types', 'typings', '__test__', '__tests__']`",
    (values) => values.split(/[ |,]/).map((value) => value.trim()),
  )
  .option(
    '-i --fileexcludes <list>',
    'pass exclude pattern of filename. default exclude directory is `[]`',
    (values) => values.split(/[ |,]/).map((value) => value.trim()),
  )
  .option(
    '-x --targetexts <list>',
    "pass include extname. default extname is `['ts', 'tsx']`. extname pass without dot charactor.",
    (values) => values.split(/[ |,]/).map((value) => value.trim()),
  )
  .option('-v --verbose', 'verbose logging message. to option false, option true')
  .option('-q --quote', "deside quote character. default quote character is '");

commander
  .command('create [cwd]')
  .alias('c')
  .description('create index.ts file in working directory')
  .action((cwd, _options) => {
    if (!cwd) {
      console.log(chalk.default.magenta('Enter working directory, '));
      console.log(chalk.default.red('cti [working directory]'));

      process.exit(1);
    }

    const cti = new TypeScritIndexWriter();
    const options: Partial<ICreateTsIndexOption> = {
      globOptions: {},
    };

    options.fileFirst = !!_options['filefirst'];
    options.addNewline = !_options['addnewline'];
    options.useSemicolon = !_options['usesemicolon'];
    options.useTimestamp = _options['usetimestamp'];
    options.includeCWD = _options['includecwd'];
    options.excludes = _options['excludes'];
    options.fileExcludePatterns = _options['fileexcludes'];
    options.targetExts = _options['targetexts'];
    options.verbose = !!_options['verbose'];
    options.quote = _options['quote'];
    options.globOptions!.cwd = cwd;

    console.log(chalk.default.green('working directory: ', cwd));

    (async () => {
      await cti.create(options);
    })();
  });

commander
  .command('entrypoint [cwd]')
  .alias('e')
  .description('create entrypoint.ts file in working directory')
  .action((cwd, _options) => {
    if (!cwd) {
      console.log(chalk.default.magenta('Enter working directory, '));
      console.log(chalk.default.red('cti [working directory]'));

      process.exit(1);
    }

    const cti = new TypeScritIndexWriter();
    const options: Partial<ICreateTsIndexOption> = {
      globOptions: {},
    };

    options.fileFirst = !!_options['filefirst'];
    options.addNewline = !_options['addnewline'];
    options.useSemicolon = !_options['usesemicolon'];
    options.useTimestamp = _options['usetimestamp'];
    options.includeCWD = _options['includecwd'];
    options.excludes = _options['excludes'];
    options.fileExcludePatterns = _options['fileexcludes'];
    options.targetExts = _options['targetexts'];
    options.verbose = !!_options['verbose'];
    options.quote = _options['quote'];
    options.globOptions!.cwd = cwd;

    console.log(chalk.default.green('working directory: ', cwd));

    (async () => {
      await cti.createEntrypoint(options);
    })();
  });

commander
  .command('clean [cwd]')
  .description('clean index.ts file in working directory')
  .alias('l')
  .action((cwd) => {
    if (!cwd) {
      console.log(chalk.default.magenta('Enter working directory, '));
      console.log(chalk.default.red('cti [working directory]'));

      process.exit(1);
    }

    const cti = new TypeScritIndexWriter();

    (async () => {
      await cti.clean(cwd);
    })();
  });

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
  // display the help text in red on the console
  commander.outputHelp((help) => chalk.default.redBright(help));
}
