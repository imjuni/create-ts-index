import * as chalk from 'chalk';
import * as fs from 'fs';
import glob from 'glob';
import * as path from 'path';
import * as util from 'util';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';

export class CommandModule {
  public static promisify = {
    glob: util.promisify<string, glob.IOptions, Array<string>>(glob),
    readDir: util.promisify<string, Array<string>>(fs.readdir),
    stat: util.promisify<string, fs.Stats>(fs.stat),
    unlink: util.promisify<fs.PathLike>(fs.unlink),
    writeFile: util.promisify<string, any, string>(fs.writeFile),
  };

  public static targetFileFilter({
    filenames,
    option,
    logger,
  }: {
    filenames: Array<string>;
    option: ICreateTsIndexOption;
    logger: CTILogger;
  }): Array<string> {
    const targetExts = option.targetExts.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`));

    try {
      const filteredFiles = filenames
        // Step 1, remove file by target extension
        .filter((filename) => targetExts.indexOf(path.extname(filename)) >= 0)

        // Step 2, remove exclude directory
        .filter((filename) => {
          return !option.excludes.reduce<boolean>((result, exclude) => {
            return result || path.dirname(filename).indexOf(exclude) >= 0;
          }, false);
        })

        // Step 3, remove declare file(*.d.ts)
        .filter((filename) => !filename.endsWith('.d.ts'))

        // Step 4, remove exclude pattern
        .filter((filename) => {
          return !option.fileExcludePatterns.reduce<boolean>((result, excludePattern) => {
            return result || filename.indexOf(excludePattern) >= 0;
          }, false);
        })

        // Step 5, remove index file(index.ts, index.tsx etc ...)
        .filter((filename) => {
          return !option.targetExts
            .map((ext) => `index.${ext}`)
            .reduce<boolean>((result, indexFile) => {
              return result || filename.indexOf(indexFile) >= 0;
            }, false);
        })

        // Step 6, remove current directory
        .filter((filename) => {
          return filename !== '.';
        });

      return filteredFiles;
    } catch (err) {
      logger.error(chalk.default.redBright('Error occured: ', err));
      return [];
    }
  }

  public static getDefaultOption(cwd?: string): ICreateTsIndexOption {
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
}
