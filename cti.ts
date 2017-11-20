import * as commander from 'commander';
import {
  ICreateTsIndexOption,
  createTypeScriptIndex,
} from './createTypeScriptIndex';

const option: ICreateTsIndexOption = {
  globOptions: {},
};

commander
  .option('-n --addnewline', '')
  .option('-s --usesemicolon', '')
  .option('-e --excludes <list>', '', values => values.split(/[ |,]/).map(value => value.trim()))
  .option('-t --targetexts <list>', '', values => values.split(/[ |,]/).map(value => value.trim()))
  .parse(process.argv);

const [cwd] = commander.args;

option.addNewline = commander['addnewline'];
option.useSemicolon = commander['usesemicolon'];
option.excludes = commander['excludes'];
option.targetExts = commander['targetexts'];
option.globOptions.cwd = cwd;

(async () => {
  await createTypeScriptIndex(option);
})();
