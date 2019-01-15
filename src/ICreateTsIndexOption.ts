import * as glob from 'glob';

export interface ICreateTsIndexOption {
  fileFirst: boolean;
  addNewline: boolean;
  useSemicolon: boolean;
  useTimestamp: boolean;
  includeCWD: boolean;
  excludes: string[];
  fileExcludePatterns: string[];
  targetExts: string[];
  globOptions: glob.IOptions;
  quote: string;
  verbose: boolean;
}
