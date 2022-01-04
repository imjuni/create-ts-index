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

  /** remove create-ts-index comment, if enable this option forced disable useTimestamp option */
  withoutComment: boolean;

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

  /** Don't create backupfile if already exists target file */
  withoutBackupFile: boolean;

  output: string;

  /** Include declaration files (*.d.ts) */
  includeDeclarationFiles: boolean;
}
