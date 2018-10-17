// tslint:disable no-console

import * as chalk from 'chalk';
import * as fs from 'fs';
import * as glob from 'glob';
import * as moment from 'moment';
import * as path from 'path';
import * as util from 'util';
import { CTIUtility } from './CTIUtility';
import { ICreateTsIndexOption } from './ICreateTsIndexOption';

const { isNotEmpty } = CTIUtility;

export class TypeScritIndexWriter {
  public static readonly readDirFunc = util.promisify<string, string[]>(fs.readdir);
  public static readonly writeFileFunc = util.promisify<string, any, string>(fs.writeFile);
  public static readonly statFunc = util.promisify<string, fs.Stats>(fs.stat);
  public static readonly globFunc = util.promisify<string, glob.IOptions, string[]>(glob);

  public async write(
    directory: string,
    directories: string[],
    option: ICreateTsIndexOption,
  ): Promise<void> {
    const indexFiles = option.targetExts.map((targetExt) => `index.${targetExt}`);

    try {
      console.log(chalk.default.yellow('Current working: ', directory));

      const resolvePath = path.resolve(option.globOptions.cwd || __dirname);
      const elements = await TypeScritIndexWriter.readDirFunc(
        path.join(resolvePath, directory),
      );

      const targets = elements
        .filter((element) => indexFiles.indexOf(element) < 0)
        .filter((element) => {
          const isTarget = option.targetExts.reduce<boolean>((result, ext) => {
            return result || CTIUtility.addDot(ext) === path.extname(element);
          }, false);

          const isHaveTarget = directories.indexOf(path.join(directory, element)) >= 0;

          return isTarget || isHaveTarget;
        });

      const stats = await Promise.all(
        targets.map((target) =>
          TypeScritIndexWriter.statFunc(path.join(resolvePath, directory, target)),
        ),
      );

      const categorized = targets.reduce<{ dir: string[]; allFiles: string[] }>(
        (result, target, index) => {
          if (stats[index].isDirectory()) {
            result.dir.push(target);
          } else {
            result.allFiles.push(target);
          }

          return result;
        },
        { dir: [], allFiles: [] },
      );

      categorized.dir.sort();

      const files = categorized.allFiles.filter((element) => {
        return !option.fileExcludePatterns.reduce<boolean>((result, excludePattern) => {
          return result || element.indexOf(excludePattern) >= 0;
        }, false);
      });

      files.sort();

      const sorted = (() => {
        if (option.fileFirst) {
          return categorized.allFiles.concat(categorized.dir);
        }

        return categorized.dir.concat(files);
      })();

      const exportString = sorted.map((target) => {
        let targetFileWithoutExt = target;

        option.targetExts.forEach((ext) => {
          return (targetFileWithoutExt = targetFileWithoutExt.replace(
            CTIUtility.addDot(ext),
            '',
          ));
        });

        if (option.useSemicolon) {
          return `export * from './${targetFileWithoutExt}';`;
        }

        return `export * from './${targetFileWithoutExt}'`;
      });

      const comment = (() => {
        if (option.useTimestamp) {
          return `// created from 'create-ts-index' ${moment(new Date()).format(
            'YYYY-MM-DD HH:mm',
          )}\n\n`;
        }
        return `// created from 'create-ts-index'\n\n`;
      })();

      const fileContent = comment + CTIUtility.addNewline(option, exportString.join('\n'));
      await TypeScritIndexWriter.writeFileFunc(
        path.join(resolvePath, directory, 'index.ts'),
        fileContent,
        'utf8',
      );
    } catch (err) {
      console.log(chalk.default.red('indexWriter: ', err.message));
    }
  }

  public async create(passed: Partial<ICreateTsIndexOption>): Promise<void> {
    try {
      const option: ICreateTsIndexOption = {
        oneFileEntrypoint: false,
        fileFirst: false,
        addNewline: true,
        useSemicolon: true,
        useTimestamp: false,
        includeCWD: true,
        excludes: ['@types', 'typings', '__test__', '__tests__', 'node_modules'],
        fileExcludePatterns: [],
        targetExts: ['ts', 'tsx'],
        globOptions: {
          cwd: process.cwd(),
          nonull: true,
          dot: true,
        },
      };

      option.oneFileEntrypoint = isNotEmpty(passed.oneFileEntrypoint)
        ? passed.oneFileEntrypoint
        : option.oneFileEntrypoint;
      option.fileFirst = isNotEmpty(passed.fileFirst) ? passed.fileFirst : option.fileFirst;
      option.addNewline = isNotEmpty(passed.addNewline)
        ? passed.addNewline
        : option.addNewline;
      option.useSemicolon = isNotEmpty(passed.useSemicolon)
        ? passed.useSemicolon
        : option.useSemicolon;
      option.useTimestamp = isNotEmpty(passed.useTimestamp)
        ? passed.useTimestamp
        : option.useTimestamp;
      option.includeCWD = isNotEmpty(passed.includeCWD)
        ? passed.includeCWD
        : option.includeCWD;
      option.fileExcludePatterns = isNotEmpty(passed.fileExcludePatterns)
        ? passed.fileExcludePatterns
        : option.fileExcludePatterns;

      option.excludes = isNotEmpty(passed.excludes) ? passed.excludes : option.excludes;
      option.targetExts = isNotEmpty(passed.targetExts)
        ? passed.targetExts
        : option.targetExts;
      option.targetExts = option.targetExts.sort((l, r) => r.length - l.length);

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

      const targetFileGlob = option.targetExts.map((ext) => `*.${ext}`).join('|');
      const allTsFiles = await TypeScritIndexWriter.globFunc(
        `**/+(${targetFileGlob})`,
        option.globOptions,
      );

      const tsFiles = allTsFiles
        // Step 1, remove exclude directory
        .map((tsFilePath) => path.dirname(tsFilePath))
        .filter((tsFilePath) => {
          return !option.excludes.reduce<boolean>((result, exclude) => {
            return result || tsFilePath.indexOf(exclude) >= 0;
          }, false);
        })

        // Step 2, remove declare file(*.d.ts)
        .filter((tsFilePath) => !tsFilePath.endsWith('.d.ts'))

        // Step 3, remove exclude pattern
        .filter((tsFilePath) => {
          return !option.fileExcludePatterns.reduce<boolean>((result, excludePattern) => {
            return result || tsFilePath.indexOf(excludePattern) >= 0;
          }, false);
        })

        // Step 4, remove index file(index.ts, index.tsx etc ...)
        .filter((tsFilePath) => {
          return !option.targetExts
            .map((ext) => `index.${ext}`)
            .reduce<boolean>((result, indexFile) => {
              return result || tsFilePath.indexOf(indexFile) >= 0;
            }, false);
        });

      const dupLibDirs = tsFiles
        .filter((tsFile) => tsFile.split(path.sep).length > 1)
        .map((tsFile) => {
          const splitted = tsFile.split(path.sep);
          const allPath = Array<number>(splitted.length - 1)
            .fill(0)
            .map((_, index) => index + 1)
            .map((index) => {
              const a = splitted.slice(0, index).join(path.sep);
              return a;
            });
          return allPath;
        })
        .reduce<string[]>((aggregated, libPath) => {
          return aggregated.concat(libPath);
        }, []);

      const dirSet: Set<string> = new Set<string>();
      dupLibDirs.forEach((dir) => dirSet.add(dir));
      tsFiles.map((tsFile) => path.dirname(tsFile)).forEach((dir) => dirSet.add(dir));

      const tsDirs = Array.from<string>(dirSet);

      if (option.includeCWD) {
        tsDirs.push('.');
      }

      tsDirs.sort(
        (left: string, right: string): number => {
          const llen = left.split(path.sep).length;
          const rlen = right.split(path.sep).length;

          if (llen > rlen) {
            return -1;
          }
          if (llen < rlen) {
            return 1;
          }
          return 0;
        },
      );

      await Promise.all(tsDirs.map((tsDir) => this.write(tsDir, tsDirs, option)));
    } catch (err) {
      console.log(chalk.default.red(err.message));
    }
  }
}
