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

type logging = (message?: any, ...optionalParams: any[]) => void;

const promisify = {
  glob: util.promisify<string, glob.IOptions, string[]>(glob),
  readDir: util.promisify<string, string[]>(fs.readdir),
  stat: util.promisify<string, fs.Stats>(fs.stat),
  unlink: util.promisify<fs.PathLike>(fs.unlink),
  writeFile: util.promisify<string, any, string>(fs.writeFile),
};

export class TypeScritIndexWriter {
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

  public logger: {
    log: logging;
    error: logging;
  } = {
    error: () => {
      return;
    },
    log: () => {
      return;
    },
  };

  public targetFileFilter(filenames: string[], option: ICreateTsIndexOption): string[] {
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
      this.logger.error(chalk.default.redBright('Error occured: ', err));
      return [];
    }
  }

  public initLogger(option: ICreateTsIndexOption) {
    if (option.verbose) {
      this.logger.log = console.log;
      this.logger.error = console.error;
    } else {
      this.logger.log = () => {
        return;
      };
      this.logger.error = console.error;
    }
  }

  public async clean(_option: Partial<ICreateTsIndexOption>) {
    const option: ICreateTsIndexOption = this.getOption(_option);

    this.initLogger(option);
    this.logger.log(chalk.default.yellowBright('Option: '), option);

    const cwd: string = option.globOptions.cwd!;
    const indexFiles = await promisify.glob('**/index.ts', {
      cwd,
      nonull: false,
    });

    const entrypointFiles = await promisify.glob('**/entrypoint.ts', {
      cwd,
      nonull: false,
    });

    const concatted = indexFiles.concat(entrypointFiles);

    if (concatted.length === 0) {
      console.log(
        chalk.default.yellow(`Cannot find target file on working directory: ${cwd}`),
      );
    }

    await Promise.all(
      concatted.map((file) => {
        this.logger.log(chalk.default.redBright('delete file: '), path.join(cwd, file));
        return promisify.unlink(path.join(cwd, file));
      }),
    );

    console.log(chalk.default.green('clean succeeded'));
  }

  public async write(
    directory: string,
    directories: string[],
    option: ICreateTsIndexOption,
  ): Promise<void> {
    const indexFiles = option.targetExts.map((targetExt) => `index.${targetExt}`);

    try {
      this.logger.log(chalk.default.yellow('Current working directory: ', directory));

      const resolvePath = path.resolve(option.globOptions.cwd || __dirname);
      const elements = await promisify.readDir(path.join(resolvePath, directory));

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
        targets.map((target) => promisify.stat(path.join(resolvePath, directory, target))),
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
      categorized.allFiles = this.targetFileFilter(categorized.allFiles, option);

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
          return `export * from ${option.quote}./${targetFileWithoutExt}${option.quote};`;
        }

        return `export * from ${option.quote}./${targetFileWithoutExt}${option.quote}`;
      });

      const comment = (() => {
        if (option.useTimestamp) {
          return `// created from ${option.quote}create-ts-index${option.quote} ${moment(
            new Date(),
          ).format('YYYY-MM-DD HH:mm')}\n\n`;
        }
        return `// created from ${option.quote}create-ts-index${option.quote}\n\n`;
      })();

      const fileContent = comment + CTIUtility.addNewline(option, exportString.join('\n'));

      this.logger.log(
        chalk.default.green('created: '),
        `${path.join(resolvePath, directory, 'index.ts')}`,
      );

      await promisify.writeFile(
        path.join(resolvePath, directory, 'index.ts'),
        fileContent,
        'utf8',
      );
    } catch (err) {
      this.logger.error(chalk.default.red('indexWriter: ', err.message));
    }
  }

  public async entryWrite(directories: string[], option: ICreateTsIndexOption): Promise<void> {
    const indexFiles = option.targetExts.map((targetExt) => `entrypoint.${targetExt}`);

    try {
      const zipFiles = await Promise.all(
        directories.map((directory) => {
          return (async () => {
            const resolvePath = path.resolve(option.globOptions.cwd || __dirname);
            const elements = await promisify.readDir(path.join(resolvePath, directory));

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
                promisify.stat(path.join(resolvePath, directory, target)),
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
            categorized.allFiles = this.targetFileFilter(categorized.allFiles, option);

            const filesInDirectory = categorized.allFiles.filter((element) => {
              return !option.fileExcludePatterns.reduce<boolean>((result, excludePattern) => {
                return result || element.indexOf(excludePattern) >= 0;
              }, false);
            });

            filesInDirectory.sort();

            return filesInDirectory.map((file) =>
              path.relative(resolvePath, path.join(resolvePath, directory, file)),
            );
          })();
        }),
      );

      const files = zipFiles.reduce((aggregated, _files) => {
        return aggregated.concat(_files);
      });

      const exportString = files.map((target) => {
        let targetFileWithoutExt = target;

        option.targetExts.forEach((ext) => {
          return (targetFileWithoutExt = targetFileWithoutExt.replace(
            CTIUtility.addDot(ext),
            '',
          ));
        });

        this.logger.log(chalk.default.green('entrypoint added from:'), target);

        if (option.useSemicolon) {
          return `export * from ${option.quote}./${targetFileWithoutExt}${option.quote};`;
        }

        return `export * from ${option.quote}./${targetFileWithoutExt}${option.quote}`;
      });

      const comment = (() => {
        if (option.useTimestamp) {
          return `// created from ${option.quote}create-ts-index${option.quote} ${moment(
            new Date(),
          ).format('YYYY-MM-DD HH:mm')}\n\n`;
        }
        return `// created from ${option.quote}create-ts-index${option.quote}\n\n`;
      })();

      const sortedExportString = exportString.sort();
      const fileContent =
        comment + CTIUtility.addNewline(option, sortedExportString.join('\n'));

      const cwdPath = option.globOptions.cwd || __dirname;

      this.logger.log(
        chalk.default.green('entrypoiny writed:', `${cwdPath}${path.sep}entrypoint.ts`),
      );

      await promisify.writeFile(path.join(cwdPath, 'entrypoint.ts'), fileContent, 'utf8');
    } catch (err) {
      this.logger.error(chalk.default.red('indexWriter: ', err.message));
      this.logger.error(chalk.default.red('indexWriter: ', err.stack));
    }
  }

  public getOption(passed: Partial<ICreateTsIndexOption>): ICreateTsIndexOption {
    const option: ICreateTsIndexOption = TypeScritIndexWriter.getDefaultOption();

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

    option.verbose = isNotEmpty(passed.verbose) ? passed.verbose : option.verbose;

    return option;
  }

  public async createEntrypoint(passed: Partial<ICreateTsIndexOption>): Promise<void> {
    try {
      const option: ICreateTsIndexOption = this.getOption(passed);

      this.initLogger(option);
      this.logger.log(chalk.default.yellowBright('Option: '), option);

      const targetFileGlob = option.targetExts.map((ext) => `*.${ext}`).join('|');
      const allTsFiles = await promisify.glob(`**/+(${targetFileGlob})`, option.globOptions);

      const tsFiles = this.targetFileFilter(allTsFiles, option);
      const dupLibDirs = tsFiles
        .filter((tsFile) => tsFile.split('/').length > 1)
        .map((tsFile) => {
          const splitted = tsFile.split('/');
          const allPath = Array<number>(splitted.length - 1)
            .fill(0)
            .map((_, index) => index + 1)
            .map((index) => {
              const a = splitted.slice(0, index).join('/');
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

      if (
        option.includeCWD &&
        tsDirs.findIndex((dir) => path.resolve(dir) === path.resolve('.')) < 0
      ) {
        tsDirs.push('.');
      }

      tsDirs.sort(
        (left: string, right: string): number => {
          const llen = left.split('/').length;
          const rlen = right.split('/').length;

          if (llen > rlen) {
            return -1;
          }
          if (llen < rlen) {
            return 1;
          }
          return 0;
        },
      );

      await this.entryWrite(tsDirs, option);

      console.log(chalk.default.green('entrypoint create succeeded'));
    } catch (err) {
      console.error(chalk.default.redBright(err));
    }
  }

  public async create(passed: Partial<ICreateTsIndexOption>): Promise<void> {
    try {
      const option: ICreateTsIndexOption = this.getOption(passed);

      this.initLogger(option);

      this.logger.log(chalk.default.yellowBright('Option: '), option);

      const targetFileGlob = option.targetExts.map((ext) => `*.${ext}`).join('|');
      const allTsFiles = await promisify.glob(`**/+(${targetFileGlob})`, option.globOptions);

      const tsFiles = this.targetFileFilter(allTsFiles, option);
      const dupLibDirs = tsFiles
        .filter((tsFile) => tsFile.split('/').length > 1)
        .map((tsFile) => {
          const splitted = tsFile.split('/');
          const allPath = Array<number>(splitted.length - 1)
            .fill(0)
            .map((_, index) => index + 1)
            .map((index) => {
              const a = splitted.slice(0, index).join('/');
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

      if (
        option.includeCWD &&
        tsDirs.findIndex((dir) => path.resolve(dir) === path.resolve('.')) < 0
      ) {
        tsDirs.push('.');
      }

      tsDirs.sort(
        (left: string, right: string): number => {
          const llen = left.split('/').length;
          const rlen = right.split('/').length;

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
      console.log(chalk.default.green('create succeeded'));
    } catch (err) {
      console.error(chalk.default.red(err.message));
    }
  }
}
