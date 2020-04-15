import debug from 'debug';
import * as fs from 'fs';
import * as glob from 'glob';
import json5 from 'json5';
import { efail, Either, epass } from 'my-easy-fp';
import * as path from 'path';
import * as util from 'util';
import { ICreateTsIndexCliOption } from './ICreateTsIndexCliOption';
import { ICreateTsIndexOption } from './ICreateTsIndexOption';

const readFile = util.promisify(fs.readFile);
const exists = util.promisify(fs.exists);
const log = debug('cti:create-test');

export const CTIRC_FILENAME = '.ctirc';

const defaultOptions: ICreateTsIndexOption = {
  addNewline: true,
  excludes: ['@types', 'typings', '__test__', '__tests__', 'node_modules'],
  fileExcludePatterns: [],
  fileFirst: false,
  globOptions: {
    cwd: process.cwd(),
    dot: true,
    nonull: true,
  },
  includeCWD: true,
  output: 'index.ts',
  quote: "'",
  targetExts: ['ts', 'tsx'],
  useSemicolon: true,
  useTimestamp: false,
  verbose: false,
  withoutBackupFile: false,
  withoutComment: false,
};

export function getRCFilename(configPath: string): string {
  log('Test Path: ', path.join(path.resolve(configPath), CTIRC_FILENAME));
  return path.join(path.resolve(configPath), CTIRC_FILENAME);
}

export function getDeafultOptions(): ICreateTsIndexOption {
  return { ...defaultOptions, globOptions: { ...defaultOptions.globOptions } };
}

export function createFromCli(
  args: Partial<ICreateTsIndexCliOption>,
  cwd: string,
  output?: string,
): Partial<ICreateTsIndexOption> {
  return {
    addNewline: args.addnewline ?? undefined,
    excludes: args.excludes ?? undefined,
    fileExcludePatterns: args.fileexcludes ?? undefined,
    fileFirst: args.filefirst ?? undefined,
    globOptions: {
      cwd,
    },
    includeCWD: args.includecwd ?? undefined,
    output: args.output ?? output ?? undefined,
    quote: args.quote ?? undefined,
    targetExts: args.targetexts ?? undefined,
    useSemicolon: args.usesemicolon ?? undefined,
    useTimestamp: args.usetimestamp ?? undefined,
    verbose: args.verbose ?? undefined,
    withoutBackupFile: args.withoutbackup ?? undefined,
    withoutComment: args.withoutcomment ?? undefined,
  };
}

export function merging(
  src: Partial<ICreateTsIndexOption>,
  dst: Partial<ICreateTsIndexOption>,
): Partial<ICreateTsIndexOption> {
  const srcGlobOptions = cleanGlobOptions(src.globOptions) ?? {};
  const dstGlobOptions = cleanGlobOptions(dst.globOptions) ?? {};

  const mergedGlobOptions = Object.keys(srcGlobOptions)
    .concat(Object.keys(dstGlobOptions))
    .reduce((obj, key) => {
      if (dstGlobOptions[key] !== undefined && dstGlobOptions[key] !== null) {
        obj[key] = dstGlobOptions[key];
        return obj;
      }

      if (srcGlobOptions[key] !== undefined && srcGlobOptions[key] !== null) {
        obj[key] = srcGlobOptions[key];
        return obj;
      }

      return obj;
    }, {});

  const full: Partial<ICreateTsIndexOption> = {
    addNewline: dst.addNewline ?? src.addNewline ?? undefined,
    excludes: dst.excludes ?? src.excludes ?? undefined,
    fileExcludePatterns: dst.fileExcludePatterns ?? src.fileExcludePatterns ?? undefined,
    fileFirst: dst.fileFirst ?? src.fileFirst ?? undefined,
    globOptions: mergedGlobOptions,
    includeCWD: dst.includeCWD ?? src.includeCWD ?? undefined,
    output: dst.output ?? src.output ?? undefined,
    quote: dst.quote ?? src.quote ?? undefined,
    targetExts: dst.targetExts ?? src.targetExts ?? undefined,
    useSemicolon: dst.useSemicolon ?? src.useSemicolon ?? undefined,
    useTimestamp: dst.useTimestamp ?? src.useTimestamp ?? undefined,
    verbose: dst.verbose ?? src.verbose ?? undefined,
    withoutBackupFile: dst.withoutBackupFile ?? src.withoutBackupFile ?? undefined,
    withoutComment: dst.withoutComment ?? src.withoutComment ?? undefined,
  };

  const cleansed = cleansing(full);

  return cleansed;
}

export function cleanGlobOptions(src?: glob.IOptions): glob.IOptions | undefined {
  if (src === undefined || src === null) {
    return undefined;
  }

  const globOptions = Object.keys(src).reduce((obj, key) => {
    const srcGlobOptions = src ?? {};

    if (srcGlobOptions[key] !== undefined && srcGlobOptions[key] !== null) {
      obj[key] =
        key === 'cwd'
          ? path.resolve(srcGlobOptions[key] ?? '')
          : (obj[key] = srcGlobOptions[key]);

      return obj;
    }

    return obj;
  }, {});

  if (Object.keys(globOptions).length <= 0) {
    return undefined;
  }

  return globOptions;
}

export function cleansing(src: Partial<ICreateTsIndexOption>): Partial<ICreateTsIndexOption> {
  const full: Partial<ICreateTsIndexOption> = {
    addNewline: src.addNewline,
    excludes: src.excludes,
    fileExcludePatterns: src.fileExcludePatterns,
    fileFirst: src.fileFirst,
    globOptions: cleanGlobOptions(src.globOptions ?? {}),
    includeCWD: src.includeCWD,
    output: src.output,
    quote: src.quote,
    targetExts: src.targetExts,
    useSemicolon: src.useSemicolon,
    useTimestamp: src.useTimestamp,
    verbose: src.verbose,
    withoutBackupFile: src.withoutBackupFile,
    withoutComment: src.withoutComment,
  };

  const cleansed = Object.keys(full).reduce<Partial<ICreateTsIndexOption>>((obj, key) => {
    if (src[key] !== undefined && src[key] !== null) {
      obj[key] = src[key];
    }

    return obj;
  }, {});

  return cleansed;
}

export async function readConfigRC(
  configPath: string,
): Promise<Either<Partial<ICreateTsIndexOption>, Error>> {
  try {
    if (await exists(configPath)) {
      const readed = await readFile(configPath);
      const converted = readed.toString();
      const config = json5.parse(converted);
      const cleansed = cleansing(config);

      if (cleansed.globOptions?.cwd !== undefined && cleansed.globOptions?.cwd !== null) {
        cleansed.globOptions.cwd = path.resolve(cleansed.globOptions.cwd);
      }

      cleansed.__for_debug_from = configPath;
      return epass(cleansed);
    }

    return epass({});
  } catch (err) {
    return efail(err);
  }
}

export function concreteConfig(config: Partial<ICreateTsIndexOption>): ICreateTsIndexOption {
  return {
    addNewline: config.addNewline ?? defaultOptions.addNewline,
    excludes: config.excludes ?? defaultOptions.excludes,
    fileExcludePatterns: config.fileExcludePatterns ?? defaultOptions.fileExcludePatterns,
    fileFirst: config.fileFirst ?? defaultOptions.fileFirst,
    globOptions: cleanGlobOptions(config.globOptions ?? {}) ?? defaultOptions.globOptions,
    includeCWD: config.includeCWD ?? defaultOptions.includeCWD,
    output: config.output ?? defaultOptions.output,
    quote: config.quote ?? defaultOptions.quote,
    targetExts: config.targetExts ?? defaultOptions.targetExts,
    useSemicolon: config.useSemicolon ?? defaultOptions.useSemicolon,
    useTimestamp: config.useTimestamp ?? defaultOptions.useTimestamp,
    verbose: config.verbose ?? defaultOptions.verbose,
    withoutBackupFile: config.withoutBackupFile ?? defaultOptions.withoutBackupFile,
    withoutComment: config.withoutComment ?? defaultOptions.withoutComment,
  };
}
