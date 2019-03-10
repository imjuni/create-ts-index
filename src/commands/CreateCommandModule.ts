import * as chalk from 'chalk';
import * as moment from 'moment';
import * as path from 'path';
import { CreateTsIndexOption } from '../options/CreateTsIndexOption';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
import { CTIUtility } from '../tools/CTIUtility';
import { CommandModule } from './CommandModule';

export class CreateCommandModule {
  public async do(passed: Partial<ICreateTsIndexOption>): Promise<void> {
    const option: CreateTsIndexOption = CreateTsIndexOption.factory({
      partialOption: passed,
    });

    const logger = new CTILogger(option);

    try {
      logger.log(chalk.default.yellowBright('Option: '), option);

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

      await Promise.all(
        tsDirs.map((tsDir) =>
          this.write({ option, logger, directory: tsDir, directories: tsDirs }),
        ),
      );

      logger.flog(chalk.default.green(`create succeeded: ${option.globOptions.cwd}`));
    } catch (err) {
      logger.ferror(chalk.default.red(err.message));
    }
  }

  public async write({
    directory,
    directories,
    option,
    logger,
  }: {
    directory: string;
    directories: string[];
    option: ICreateTsIndexOption;
    logger: CTILogger;
  }): Promise<void> {
    const indexFiles = option.targetExts.map((targetExt) => `index.${targetExt}`);

    try {
      logger.log(chalk.default.yellow('Current working directory: ', directory));

      const resolvePath = path.resolve(option.globOptions.cwd || __dirname);
      const elements = await CommandModule.promisify.readDir(
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
          CommandModule.promisify.stat(path.join(resolvePath, directory, target)),
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

      logger.log(
        chalk.default.green('created: '),
        `${path.join(resolvePath, directory, 'index.ts')}`,
      );

      await CommandModule.promisify.writeFile(
        path.join(resolvePath, directory, 'index.ts'),
        fileContent,
        'utf8',
      );
    } catch (err) {
      logger.error(chalk.default.red('indexWriter: ', err.message));
    }
  }
}
