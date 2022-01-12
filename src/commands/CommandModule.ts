import * as chalk from 'chalk';
import debug from 'debug';
import * as fs from 'fs';
import glob from 'glob';
import minimatch from 'minimatch';
import * as path from 'path';
import * as util from 'util';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';

const log = debug('cti:CommandModule');

export class CommandModule {
  public static promisify = {
    glob: util.promisify<string, glob.IOptions, Array<string>>(glob),
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
      log('Start filter logic', option.fileExcludePatterns, filenames);

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
        .filter((filename) => {
          return (option.includeDeclarationFiles) || !filename.endsWith('.d.ts')
        })

        // Step 4, remove exclude pattern
        .filter((filename) => {
          return !option.fileExcludePatterns.reduce<boolean>((result, excludePattern) => {
            log(
              'ExcludePattern: ',
              glob.hasMagic(excludePattern, option.globOptions),
              result || minimatch(filename, excludePattern),
            );

            if (!glob.hasMagic(excludePattern, option.globOptions)) {
              // backward compatibility for indexOf
              return result || minimatch(filename, `*${excludePattern}*`);
            }

            return result || minimatch(filename, excludePattern);
          }, false);
        })

        // Step 5, remove index file(index.ts, index.tsx etc ...)
        .filter((filename) => {
          return filename !== "index.d.ts" && !option.targetExts
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
    } catch (catched) {
      const err = catched instanceof Error ? catched : new Error('unknown error raised');

      log(err.message);
      log(err.stack);

      logger.error(chalk.default.redBright('Error occured: ', catched));

      return [];
    }
  }
}
