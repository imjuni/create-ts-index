import * as glob from 'glob';

export interface ICreateTsIndexOption {
  oneFileEntrypoint: boolean;
  fileFirst: boolean;
  addNewline: boolean;
  useSemicolon: boolean;
  useTimestamp: boolean;
  includeCWD: boolean;
  excludes: string[];
  fileExcludePatterns: string[];
  targetExts: string[];
  globOptions: glob.IOptions;
}
