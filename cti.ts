#!/usr/bin/env node

import * as chalk from 'chalk';
import * as commander from 'commander';
import {
  ICreateTsIndexOption,
  createTypeScriptIndex,
} from './createTypeScriptIndex';

const option: ICreateTsIndexOption = {
  globOptions: {},
};

// -f -n -s -t -e -x
commander
  .option('-f --filefirst', 'export list create filefirst, no option false, option true')
  .option('-n --addnewline', 'deside add newline file ending. no option true, option false')
  .option('-s --usesemicolon', 'deside use semicolon line ending. no option true, option false')
  .option(
    '-t --usetimestamp',
    'deside use timestamp(YYYY-MM-DD HH:mm) top line comment. no option false, option true',
  )
  .option(
    '-e --excludes <list>',
    'pass exclude directory. default exclude directory is `[\'@types\', \'typings\', \'__test__\', \'__tests__\']`', // tslint:disable-line
    values => values.split(/[ |,]/).map(value => value.trim()),
  )
  .option(
    '-x --targetexts <list>',
    'pass include extname. default extname is `[\'ts\', \'tsx\']`. extname pass without dot charactor.', // tslint:disable-line
    values => values.split(/[ |,]/).map(value => value.trim()),
  )
  .parse(process.argv);

const [cwd] = commander.args;

if (!cwd) {
  console.log(chalk.default.magenta('Enter working directory, '));
  console.log(chalk.default.red('cti [working directory]'));

  process.exit(1);
}

console.log(chalk.default.green('working directory: ', cwd));

option.fileFirst = !!commander['filefirst'];
option.addNewline = !commander['addnewline'];
option.useSemicolon = !commander['usesemicolon'];
option.useTimestamp =  commander['usetimestamp'];
option.excludes = commander['excludes'];
option.targetExts = commander['targetexts'];
option.globOptions.cwd = cwd;

(async () => {
  await createTypeScriptIndex(option);
})();
