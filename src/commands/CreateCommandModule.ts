import chalk from 'chalk';
import dayjs from 'dayjs';
import debug from 'debug';
import * as TEI from 'fp-ts/Either';
import * as path from 'path';
import * as fs from 'fs';
import {
  concreteConfig,
  getDeafultOptions,
  getRCFilename,
  merging,
  readConfigRC,
} from '../options/configure';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
import { addNewline, isNotEmpty } from '../tools/CTIUtility';
import { getExportStatementCreator } from '../tools/exportStatement';
import { CommandModule } from './CommandModule';
import { ICommandModule } from './ICommandModule';
import { exists } from '../tools/exists';

const log = debug('cti:CreateCommandModule');

export class CreateCommandModule implements ICommandModule {
  public async do(executePath: string, passed: Partial<ICreateTsIndexOption>): Promise<void> {
    const workDir =
      isNotEmpty(passed.globOptions) && isNotEmpty(passed.globOptions.cwd)
        ? passed.globOptions.cwd
        : process.cwd();

    const configFromExecutePath = await readConfigRC(getRCFilename(executePath));
    const configFromWorkDir = await readConfigRC(getRCFilename(workDir));

    const option = concreteConfig(
      merging(
        merging(
          TEI.isRight(configFromExecutePath)
            ? configFromExecutePath.right
            : getDeafultOptions(),
          TEI.isRight(configFromWorkDir) ? configFromWorkDir.right : getDeafultOptions(),
        ),
        passed,
      ),
    );

    const logger = new CTILogger(option.verbose);

    try {
      logger.log(chalk.yellowBright('Option: '), option);

      log('opt: ', option);

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

      tsDirs.sort((left: string, right: string): number => {
        const llen = left.split('/').length;
        const rlen = right.split('/').length;

        if (llen > rlen) {
          return -1;
        }

        if (llen < rlen) {
          return 1;
        }
        return 0;
      });

      log('tsDirs:: ', tsDirs);

      await Promise.all(
        tsDirs.map((tsDir) =>
          this.write({ option, logger, directory: tsDir, directories: tsDirs }),
        ),
      );

      logger.flog(chalk.green(`create succeeded: ${option.globOptions.cwd}`));
    } catch (catched) {
      const err = catched instanceof Error ? catched : new Error('unknown error raised');

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
      const elements = await fs.promises.readdir(path.join(resolvePath, directory));

      const stats = await Promise.all(
        elements.map((target) => fs.promises.stat(path.join(resolvePath, directory, target))),
      );

      const statMap = elements.reduce((map, element, index) => {
        map[element] = stats[index];
        return map;
      }, {});

      const targets = elements
        .filter((element) => statMap[element].isDirectory() || element !== 'index.ts')
        .filter((element) => statMap[element].isDirectory() || element !== 'entrypoint.ts')
        .filter((element) => statMap[element].isDirectory() || element !== option.output);

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

      const excludePatternFilteredDirs = categorized.dir.filter((element) => {
        return !option.excludes.reduce<boolean>((result, excludePattern) => {
          return result || element.indexOf(excludePattern) >= 0;
        }, false);
      });

      excludePatternFilteredDirs.sort();

      categorized.allFiles = CommandModule.targetFileFilter({
        logger,
        option,
        filenames: categorized.allFiles,
      });

      const excludePatternFilteredFiles = [...categorized.allFiles].sort();

      const sorted = (() => {
        if (option.fileFirst) {
          return categorized.allFiles.concat(excludePatternFilteredDirs);
        }

        return excludePatternFilteredDirs.concat(excludePatternFilteredFiles);
      })();

      const getExport = getExportStatementCreator(option, logger);
      const exportString = sorted.map((target) => getExport(target));

      const _buildComment = () => {
        if (option.withoutComment) {
          return '';
        }

        if (option.useTimestamp) {
          return `// created from ${option.quote}create-ts-index${
            option.quote
          } ${dayjs().format('YYYY-MM-DD HH:mm')}\n\n`;
        }

        return `// created from ${option.quote}create-ts-index${option.quote}\n\n`;
      };
      const comment = _buildComment();

      const fileContent = comment + addNewline(option, exportString.join('\n'));

      logger.log(
        chalk.green('created: '),
        `${path.join(resolvePath, directory, option.output)}`,
      );

      if (option.withoutBackupFile) {
        await fs.promises.writeFile(
          path.join(resolvePath, directory, option.output),
          fileContent,
          'utf8',
        );

        return;
      }

      const indexFile = path.join(resolvePath, directory, option.output);
      const indexBackupFile = path.join(resolvePath, directory, `${option.output}.bak`);

      if (await exists(indexFile)) {
        logger.log(chalk.green('created: '), `${indexBackupFile}`);

        await fs.promises.writeFile(
          indexBackupFile,
          await fs.promises.readFile(indexFile),
          'utf8',
        );
      }

      await fs.promises.writeFile(indexFile, fileContent, 'utf8');
    } catch (catched) {
      const err = catched instanceof Error ? catched : new Error('unknown error raised');

      log(err.message);
      log(err.stack);

      logger.error(chalk.red('indexWriter: ', err.message));
    }
  }
}
