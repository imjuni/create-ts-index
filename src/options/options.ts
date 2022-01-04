import { Options } from 'yargs';
import { ICreateTsIndexCliOption } from './ICreateTsIndexCliOption';

type TKEY_OF_CLI_OPTIONS = keyof ICreateTsIndexCliOption;

export const options = new Map<TKEY_OF_CLI_OPTIONS, Options>([
  [
    'filefirst',
    {
      alias: 'f',
      describe: 'export list create file first, no option false, option true',
      type: 'boolean',
    },
  ],
  [
    'addnewline',
    {
      alias: 'n',
      describe: 'decide add newline file ending. no option true, option false',
      type: 'boolean',
    },
  ],
  [
    'usesemicolon',
    {
      alias: 's',
      describe: 'decide use semicolon line ending. no option true, option false',
      type: 'boolean',
    },
  ],
  [
    'includecwd',
    {
      alias: 'c',
      describe: 'decide include cwd directory in task. no option true, option false',
      type: 'boolean',
    },
  ],
  [
    'usetimestamp',
    {
      alias: 't',
      // tslint:disable-next-line
      describe: `decide use timestamp(YYYY-MM-DD HH:mm) top line comment. \nno option false, option true`,
      type: 'boolean',
    },
  ],
  [
    'excludes',
    {
      alias: 'e',
      array: true,
      // tslint:disable-next-line
      describe: `pass exclude directory. default exclude directory is ['@types', 'typings', '__test__', '__tests__']`,
      type: 'string',
    },
  ],
  [
    'fileexcludes',
    {
      alias: 'i',
      array: true,
      describe: 'pass exclude pattern of filename. default exclude directory is "[]"',
      type: 'string',
    },
  ],
  [
    'targetexts',
    {
      alias: 'x',
      array: true,
      // tslint:disable-next-line
      describe: `pass include extname. default extname is ["ts", "tsx"]. extname \npass without dot character.`,
      type: 'string',
    },
  ],
  [
    'withoutcomment',
    {
      alias: 'w',
      describe: 'remove comment from created file',
      type: 'boolean',
    },
  ],
  [
    'withoutbackup',
    {
      alias: 'b',
      describe: "Don't create backup file if already exists target file",
      type: 'boolean',
    },
  ],
  [
    'verbose',
    {
      alias: 'v',
      describe: 'verbose logging message. to option false, option true',
      type: 'boolean',
    },
  ],
  [
    'quote',
    {
      alias: 'q',
      describe: "decide quote character. default quote character is '",
      type: 'string',
    },
  ],
  [
    'output',
    {
      alias: 'o',
      describe: 'set output filename. default index.ts or entrypoint.ts',
      type: 'string',
    },
  ],
]);
