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

// -f -n -s -t -e -x -i -c
commander
  .option('-f --filefirst', 'export list create filefirst, no option false, option true')
  .option('-n --addnewline', 'decide to add newline file ending. no option true, option false')
  .option('-s --usesemicolon', 'decide to use semicolon line ending. no option true, option false')
  .option('-d --usedoublequote', 'decide to use double quote for import from. with option true, without option false')
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
    'pass exclude directory. default exclude directory is `[\'@types\', \'typings\', \'__test__\', \'__tests__\']`', // tslint:disable-line
    values => values.split(/[ |,]/).map(value => value.trim()),
  )
  .option(
    '-i --fileexcludes <list>',
    'pass exclude pattern of filename. default exclude directory is `[]`', // tslint:disable-line
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
option.useDoubleQuote = commander['usedoublequote'];
option.useTimestamp =  commander['usetimestamp'];
option.includeCWD =  commander['includecwd'];
option.excludes = commander['excludes'];
option.fileExcludePatterns = commander['fileexcludes'];
option.targetExts = commander['targetexts'];
option.globOptions.cwd = cwd;

(async () => {
  await createTypeScriptIndex(option);
})();
