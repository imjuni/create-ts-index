import debug from 'debug';
import * as glob from 'glob';
import { isNotEmpty } from '../tools/CTIUtility';
import { ICreateTsIndexCliOption } from './ICreateTsIndexCliOption';
import { ICreateTsIndexOption } from './ICreateTsIndexOption';
import { TCleanCliOption, TEntrypointCliOption, TInitCliOption } from './partialCliOption';

const log = debug('cti:CreateTsIndexOption');

export function createOptionBuilder(
  args: ICreateTsIndexCliOption,
  cwd: string,
): ICreateTsIndexOption {
  log('create option building');

  return {
    addNewline: args.addnewline,
    excludes: args.excludes,
    fileExcludePatterns: args.fileexcludes,
    fileFirst: args.filefirst,
    globOptions: {
      cwd,
    },
    includeCWD: args.includecwd,
    quote: args.quote,
    targetExts: args.targetexts,
    useSemicolon: args.usesemicolon,
    useTimestamp: args.usetimestamp,
    verbose: args.verbose,
  };
}

export function entrypointOptionBuilder(
  args: TEntrypointCliOption,
  cwd: string,
): ICreateTsIndexOption {
  log('entrypoint option building');

  return {
    addNewline: args.addnewline,
    excludes: args.excludes,
    fileExcludePatterns: args.fileexcludes,
    fileFirst: false,
    globOptions: {
      cwd,
    },
    includeCWD: args.includecwd,
    quote: args.quote,
    targetExts: args.targetexts,
    useSemicolon: args.usesemicolon,
    useTimestamp: args.usetimestamp,
    verbose: args.verbose,
  };
}

export function cleanOptionBuilder(args: TCleanCliOption, cwd: string): ICreateTsIndexOption {
  log('clean option building');

  return {
    addNewline: false,
    excludes: [],
    fileExcludePatterns: [],
    fileFirst: false,
    globOptions: {
      cwd,
    },
    includeCWD: false,
    quote: "'",
    targetExts: [],
    useSemicolon: false,
    useTimestamp: false,
    verbose: args.verbose,
  };
}

export function initOptionBuilder(args: TInitCliOption, cwd: string): ICreateTsIndexOption {
  log('init option building');

  return {
    addNewline: args.addnewline,
    excludes: [],
    fileExcludePatterns: [],
    fileFirst: false,
    globOptions: {
      cwd,
    },
    includeCWD: false,
    quote: "'",
    targetExts: [],
    useSemicolon: false,
    useTimestamp: args.usetimestamp,
    verbose: args.verbose,
  };
}

export function getDefailtICreateTsIndexOption(cwd?: string): ICreateTsIndexOption {
  return {
    addNewline: true,
    excludes: ['@types', 'typings', '__test__', '__tests__', 'node_modules'],
    fileExcludePatterns: [],
    fileFirst: false,
    globOptions: {
      cwd: isNotEmpty(cwd) ? cwd : process.cwd(),
      dot: true,
      nonull: true,
    },
    includeCWD: true,
    quote: "'",
    targetExts: ['ts', 'tsx'],
    useSemicolon: true,
    useTimestamp: false,
    verbose: false,
  };
}

export class CreateTsIndexOption {
  public static factory({
    option,
    partialOption,
  }: {
    option?: ICreateTsIndexOption;
    partialOption?: Partial<ICreateTsIndexOption>;
  }): CreateTsIndexOption {
    if (isNotEmpty(option)) {
      const createTsIndexOption = new CreateTsIndexOption(option);
      return createTsIndexOption;
    }

    if (isNotEmpty(partialOption)) {
      const createTsIndexOption = CreateTsIndexOption.getOption(partialOption);
      return createTsIndexOption;
    }

    const defaultOption = getDefailtICreateTsIndexOption();
    return new CreateTsIndexOption(defaultOption);
  }

  public static getOption(passed: Partial<ICreateTsIndexOption>): CreateTsIndexOption {
    const option: ICreateTsIndexOption = getDefailtICreateTsIndexOption();

    option.fileFirst = isNotEmpty(passed.fileFirst) ? passed.fileFirst : option.fileFirst;
    option.addNewline = isNotEmpty(passed.addNewline) ? passed.addNewline : option.addNewline;
    option.useSemicolon = isNotEmpty(passed.useSemicolon)
      ? passed.useSemicolon
      : option.useSemicolon;
    option.useTimestamp = isNotEmpty(passed.useTimestamp)
      ? passed.useTimestamp
      : option.useTimestamp;
    option.includeCWD = isNotEmpty(passed.includeCWD) ? passed.includeCWD : option.includeCWD;
    option.fileExcludePatterns = isNotEmpty(passed.fileExcludePatterns)
      ? passed.fileExcludePatterns
      : option.fileExcludePatterns;

    option.excludes = isNotEmpty(passed.excludes) ? passed.excludes : option.excludes;
    option.targetExts = isNotEmpty(passed.targetExts) ? passed.targetExts : option.targetExts;

    // remove sorting
    // option.targetExts = option.targetExts.sort((l, r) => r.length - l.length);

    if (isNotEmpty(passed.globOptions)) {
      option.globOptions.cwd = isNotEmpty(passed.globOptions.cwd)
        ? passed.globOptions.cwd
        : option.globOptions.cwd;
      option.globOptions.nonull = isNotEmpty(passed.globOptions.nonull)
        ? passed.globOptions.nonull
        : option.globOptions.nonull;
      option.globOptions.dot = isNotEmpty(passed.globOptions.dot)
        ? passed.globOptions.dot
        : option.globOptions.dot;
    }

    option.verbose = isNotEmpty(passed.verbose) ? passed.verbose : option.verbose;

    return new CreateTsIndexOption(option);
  }

  /** enable file first */
  public readonly fileFirst: boolean;
  /** add newline on EOF */
  public readonly addNewline: boolean;
  /** add semicolon on every export statement */
  public readonly useSemicolon: boolean;
  /** add timestamp on creation comment */
  public readonly useTimestamp: boolean;
  /** current working directory add to creation work */
  public readonly includeCWD: boolean;
  /** exclude directories */
  public readonly excludes: Array<string>;
  /** file exclude pattern */
  public readonly fileExcludePatterns: Array<string>;
  /** file exclude by extension */
  public readonly targetExts: Array<string>;
  /** glob option */
  public readonly globOptions: glob.IOptions;
  /** quote mark " or ' */
  public readonly quote: string;
  /** disply verbose logging message */
  public readonly verbose: boolean;

  constructor(
    fileFirst?: boolean | ICreateTsIndexOption,
    addNewline?: boolean,
    useSemicolon?: boolean,
    useTimestamp?: boolean,
    includeCWD?: boolean,
    excludes?: Array<string>,
    fileExcludePatterns?: Array<string>,
    targetExts?: Array<string>,
    globOptions?: glob.IOptions,
    quote?: string,
    verbose?: boolean,
  ) {
    if (typeof fileFirst === 'boolean') {
      this.fileFirst = fileFirst;
      this.addNewline = isNotEmpty(addNewline) ? addNewline : true;
      this.useSemicolon = isNotEmpty(useSemicolon) ? useSemicolon : true;
      this.useTimestamp = isNotEmpty(useTimestamp) ? useTimestamp : false;
      this.includeCWD = isNotEmpty(includeCWD) ? includeCWD : true;
      this.excludes = isNotEmpty(excludes)
        ? excludes
        : ['@types', 'typings', '__test__', '__tests__', 'node_modules'];
      this.fileExcludePatterns = isNotEmpty(fileExcludePatterns) ? fileExcludePatterns : [];
      this.targetExts = isNotEmpty(targetExts) ? targetExts : ['ts', 'tsx'];
      this.globOptions = isNotEmpty(globOptions)
        ? globOptions
        : {
            cwd: process.cwd(),
            dot: true,
            nonull: true,
          };
      this.quote = isNotEmpty(quote) ? quote : "'";
      this.verbose = isNotEmpty(verbose) ? verbose : false;
    } else {
      const {
        fileFirst: _fileFirst,
        addNewline: _addNewline,
        useSemicolon: _useSemicolon,
        useTimestamp: _useTimestamp,
        includeCWD: _includeCWD,
        excludes: _excludes,
        fileExcludePatterns: _fileExcludePatterns,
        targetExts: _targetExts,
        globOptions: _globOptions,
        quote: _quote,
        verbose: _verbose,
      } = fileFirst || getDefailtICreateTsIndexOption();

      this.fileFirst = _fileFirst;
      this.addNewline = _addNewline;
      this.useSemicolon = _useSemicolon;
      this.useTimestamp = _useTimestamp;
      this.includeCWD = _includeCWD;
      this.excludes = _excludes;
      this.fileExcludePatterns = _fileExcludePatterns;
      this.targetExts = _targetExts;
      this.globOptions = _globOptions;
      this.quote = _quote;
      this.verbose = _verbose;
    }
  }
}
