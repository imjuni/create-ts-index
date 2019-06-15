import chalk from 'chalk';
import debug from 'debug';
import * as moment from 'moment';
import * as path from 'path';
import { ctircLoader } from '../options/ctircLoader';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
import { addNewline, isNotEmpty } from '../tools/CTIUtility';
import { getExportStatementCreator } from '../tools/exportStatement';
import { CommandModule } from './CommandModule';
import { ICommandModule } from './ICommandModule';

const log = debug('cti:CreateCommandModule');

export class CreateCommandModule implements ICommandModule {
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

    logger.log(
      chalk.yellowBright('Configuration from: '),
      readedFrom === '' ? 'default' : readedFrom,
    );

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

      log('tsDirs:: ', tsDirs);

      await Promise.all(
        tsDirs.map((tsDir) =>
          this.write({ option, logger, directory: tsDir, directories: tsDirs }),
        ),
      );

      logger.flog(chalk.green(`create succeeded: ${option.globOptions.cwd}`));
    } catch (err) {
      log(err.message);
      log(err.stack);

      logger.ferror(chalk.red(err.message));
    }
  }

  public async write({
    directory,
    option,
    logger,
  }: {
    directory: string;
    directories: Array<string>;
    option: ICreateTsIndexOption;
    logger: CTILogger;
  }): Promise<void> {
    try {
      logger.log(chalk.yellowBright('Current working directory: ', directory));

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
        .filter((element) => statMap[element].isDirectory() || element !== 'entrypoint.ts');

      const categorized = targets.reduce<{ dir: Array<string>; allFiles: Array<string> }>(
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

      const getExport = getExportStatementCreator(option, logger);
      const exportString = sorted.map((target) => getExport(target));

      const comment = (() => {
        if (option.useTimestamp) {
          return `// created from ${option.quote}create-ts-index${option.quote} ${moment(
            new Date(),
          ).format('YYYY-MM-DD HH:mm')}\n\n`;
        }
        return `// created from ${option.quote}create-ts-index${option.quote}\n\n`;
      })();

      const fileContent = comment + addNewline(option, exportString.join('\n'));

      logger.log(chalk.green('created: '), `${path.join(resolvePath, directory, 'index.ts')}`);

      await CommandModule.promisify.writeFile(
        path.join(resolvePath, directory, 'index.ts'),
        fileContent,
        'utf8',
      );
    } catch (err) {
      log(err.message);
      log(err.stack);

      logger.error(chalk.red('indexWriter: ', err.message));
    }
  }
}
