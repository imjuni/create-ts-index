import chalk from 'chalk';
import * as moment from 'moment';
import * as path from 'path';
import { ctircLoader } from '../options/ctircLoader';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
import { addNewline, isNotEmpty } from '../tools/CTIUtility';
import { getExportStatementCreator } from '../tools/exportStatement';
import { CommandModule } from './CommandModule';
import { ICommandModule } from './ICommandModule';

export class EntrypointCommandModule implements ICommandModule {
  public async do(cliCwd: string, passed: Partial<ICreateTsIndexOption>): Promise<void> {
    const cwd =
      isNotEmpty(passed.globOptions) && isNotEmpty(passed.globOptions.cwd)
        ? passed.globOptions.cwd
        : process.cwd();

    const { readedFrom, option } = ctircLoader({
      cwd: cliCwd,
      fromCliOption: passed,
      inputDir: cwd,
    });
    const logger = new CTILogger(option.verbose);
    logger.log('configuration from: ', readedFrom === '' ? 'default' : readedFrom);

    try {
      logger.log(chalk.yellowBright('Option: '), option);

      const targetFileGlob = option.targetExts.map((ext) => `*.${ext}`).join('|');
      const allTsFiles = await CommandModule.promisify.glob(
        `**/+(${targetFileGlob})`,
        option.globOptions,
      );

      const tsFiles = CommandModule.targetFileFilter({
        logger,
        option,
        filenames: allTsFiles,
      });
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
        .reduce<Array<string>>((aggregated, libPath) => {
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

      await this.write({ logger, option, directories: tsDirs });

      logger.flog(chalk.green(`entrypoint create succeeded: ${option.globOptions.cwd}`));
    } catch (err) {
      logger.ferror(chalk.redBright(err));
    }
  }

  public async write({
    directories,
    option,
    logger,
  }: {
    directories: Array<string>;
    option: ICreateTsIndexOption;
    logger: CTILogger;
  }): Promise<void> {
    try {
      const zipFiles = await Promise.all(
        directories.map((directory) => {
          return (async () => {
            const resolvePath = path.resolve(option.globOptions.cwd || __dirname);
            const elements = await CommandModule.promisify.readDir(
              path.join(resolvePath, directory),
            );

            const stats = await Promise.all(
              elements.map((target) =>
                CommandModule.promisify.stat(path.join(resolvePath, directory, target)),
              ),
            );

            const statMap = elements.reduce((map, element, index) => {
              map[element] = stats[index];
              return map;
            }, {});

            const targets = elements
              .filter((element) => statMap[element].isDirectory() || element !== 'index.ts')
              .filter(
                (element) => statMap[element].isDirectory() || element !== 'entrypoint.ts',
              );

            const categorized = targets.reduce<{
              dir: Array<string>;
              allFiles: Array<string>;
            }>(
              (result, target) => {
                if (statMap[target].isDirectory()) {
                  result.dir.push(target);
                } else {
                  result.allFiles.push(target);
                }

                return result;
              },
              { dir: [], allFiles: [] },
            );

            categorized.dir.sort();
            categorized.allFiles = CommandModule.targetFileFilter({
              logger,
              option,
              filenames: categorized.allFiles,
            });

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

      const getExport = getExportStatementCreator(option, logger);
      const exportString = files.map((target) => getExport(target));

      const comment = (() => {
        if (option.useTimestamp) {
          return `// created from ${option.quote}create-ts-index${option.quote} ${moment(
            new Date(),
          ).format('YYYY-MM-DD HH:mm')}\n\n`;
        }
        return `// created from ${option.quote}create-ts-index${option.quote}\n\n`;
      })();

      const sortedExportString = exportString.sort();
      const fileContent = comment + addNewline(option, sortedExportString.join('\n'));

      const cwdPath = option.globOptions.cwd || __dirname;

      logger.log(chalk.green('entrypoiny writed:', `${cwdPath}${path.sep}entrypoint.ts`));

      await CommandModule.promisify.writeFile(
        path.join(cwdPath, 'entrypoint.ts'),
        fileContent,
        'utf8',
      );
    } catch (err) {
      logger.error(chalk.red('indexWriter: ', err.message));
      logger.error(chalk.red('indexWriter: ', err.stack));
    }
  }
}
