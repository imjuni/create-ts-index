import * as glob from 'glob';

/**
 * Option interface for CreateTsIndex
 */
export interface ICreateTsIndexOption {
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
  excludes: string[];

  /** file exclude pattern */
  fileExcludePatterns: string[];

  /** file exclude by extension */
  targetExts: string[];

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
  excludes: string[];
  fileexcludes: string[];
  targetexts: string[];
  verbose: boolean;
  quote: string;
}
