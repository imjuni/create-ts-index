import { ICreateTsIndexCliOption } from './ICreateTsIndexCliOption';

export type TEntrypointCliOption = Pick<
  ICreateTsIndexCliOption,
  Extract<
    keyof ICreateTsIndexCliOption,
    | 'cwds'
    | 'addnewline'
    | 'usesemicolon'
    | 'includecwd'
    | 'usetimestamp'
    | 'excludes'
    | 'fileexcludes'
    | 'targetexts'
    | 'verbose'
    | 'quote'
  >
>;

export type TInitCliOption = Pick<
  ICreateTsIndexCliOption,
  Extract<keyof ICreateTsIndexCliOption, 'cwds' | 'addnewline' | 'usetimestamp' | 'verbose'>
>;

export type TCleanCliOption = Pick<
  ICreateTsIndexCliOption,
  Extract<keyof ICreateTsIndexCliOption, 'cwds' | 'verbose'>
>;
