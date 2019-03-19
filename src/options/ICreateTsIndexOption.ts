import * as glob from 'glob';

/**
 * Option interface for CreateTsIndex
 */
export interface ICreateTsIndexOption {
  /** for debugging option, representative from option */
  __for_debug_from?: string;

  /** enable file first */
  fileFirst: boolean;

  /** add newline on EOF */
  addNewline: boolean;

  /** add semicolon on every export statement */
  useSemicolon: boolean;

  /** add timestamp on creation comment */
  useTimestamp: boolean;

  /** current working directory add to creation work */
  includeCWD: boolean;

  /** exclude directories */
  excludes: Array<string>;

  /** file exclude pattern */
  fileExcludePatterns: Array<string>;

  /** file exclude by extension */
  targetExts: Array<string>;

  /** glob option */
  globOptions: glob.IOptions;

  /** quote mark " or ' */
  quote: string;

  /** disply verbose logging message */
  verbose: boolean;
}

export interface ICreateTsIndexCliOption {
  filefirst: boolean;
  addnewline: boolean;
  usesemicolon: boolean;
  includecwd: boolean;
  usetimestamp: boolean;
  excludes: Array<string>;
  fileexcludes: Array<string>;
  targetexts: Array<string>;
  verbose: boolean;
  quote: string;
}
