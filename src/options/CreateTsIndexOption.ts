import debug from 'debug';
import * as glob from 'glob';
import { CTIUtility } from '../tools/CTIUtility';
import { ICreateTsIndexCliOption, ICreateTsIndexOption } from './ICreateTsIndexOption';

const { isNotEmpty } = CTIUtility;
const log = debug('cti:CreateTsIndexOption');

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

    const defaultOption = CreateTsIndexOption.getDefailtICreateTsIndexOption();
    return new CreateTsIndexOption(defaultOption);
  }

  public static cliOptionBuilder(
    args: ICreateTsIndexCliOption,
    cwd: string,
  ): ICreateTsIndexOption {
    const options: ICreateTsIndexOption = {
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

    return options;
  }

  public static getDefailtICreateTsIndexOption(cwd?: string): ICreateTsIndexOption {
    return {
      addNewline: true,
      excludes: ['@types', 'typings', '__test__', '__tests__', 'node_modules'],
      fileExcludePatterns: [],
      fileFirst: false,
      globOptions: {
        cwd: cwd || process.cwd(),
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

  public static merge<T>(
    deep: boolean,
    isNotCopyEmpty: boolean,
    src: T,
    ...dsts: Array<T>
  ): T {
    const merged: Partial<T> = (() => {
      if (deep) {
        return { ...src };
      }

      return src;
    })();

    const srcKeys = Object.keys(src);

    dsts.forEach((dst) => {
      // tslint:disable-next-line
      log('__for_debug_from: ', dst['__for_debug_from']);

      const dstKeys = Object.keys(dst);
      const keySet = new Set<string>(srcKeys.concat(dstKeys));

      Array.from(keySet).forEach((key) => {
        if (
          typeof merged[key] === 'string' ||
          typeof merged[key] === 'number' ||
          typeof merged[key] === 'boolean' ||
          typeof merged[key] === 'bigint' ||
          typeof merged[key] === 'symbol' ||
          typeof merged[key] === 'undefined'
        ) {
          if (isNotCopyEmpty && isNotEmpty(dst[key])) {
            merged[key] = dst[key];
          } else if (!isNotCopyEmpty) {
            merged[key] = dst[key];
          }
        } else if (typeof merged[key] === 'object' && Array.isArray(merged[key])) {
          const element = new Set<any>(merged[key].concat(dst[key]));
          merged[key] = Array.from(element).filter(
            (configElement) => isNotCopyEmpty && isNotEmpty(configElement),
          );
        } else if (typeof merged[key] === 'object') {
          merged[key] = CreateTsIndexOption.merge(deep, isNotCopyEmpty, merged[key], dst[key]);
        }
      });
    });

    return merged as any;
  }
  /**
   * Merge configurations by passing order
   *
   * @param passeds Passed variadic configurations
   */
  public static mergeOptions(
    ...passeds: Array<Partial<ICreateTsIndexOption>>
  ): CreateTsIndexOption {
    const [first, ...remains] = passeds;
    log('from: ', first.__for_debug_from);

    const merged: ICreateTsIndexOption = CreateTsIndexOption.merge(
      true,
      true,
      first,
      ...remains,
    ) as any;
    return new CreateTsIndexOption(merged);
  }

  public static getOption(passed: Partial<ICreateTsIndexOption>): CreateTsIndexOption {
    const option: ICreateTsIndexOption = CreateTsIndexOption.getDefailtICreateTsIndexOption();

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
      } = fileFirst || CreateTsIndexOption.getDefailtICreateTsIndexOption();

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
