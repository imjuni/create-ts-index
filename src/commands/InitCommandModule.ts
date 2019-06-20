import chalk from 'chalk';
import * as dayjs from 'dayjs';
import debug from 'debug';
import * as fs from 'fs';
import * as json5 from 'json5';
import * as path from 'path';
import { getDefailtICreateTsIndexOption } from '../options/CreateTsIndexOption';
import { ctircLoader } from '../options/ctircLoader';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
import { isNotEmpty } from '../tools/CTIUtility';
import { ICommandModule } from './ICommandModule';

const log = debug('cti:InitCommandModule');

export class InitCommandModule implements ICommandModule {
  public async do(cliCwd: string, passed: Partial<ICreateTsIndexOption>): Promise<void> {
    const cwd =
      isNotEmpty(passed.globOptions) && isNotEmpty(passed.globOptions.cwd)
        ? passed.globOptions.cwd
        : process.cwd();

    const { readedFrom, option } = ctircLoader({
      cwd: cliCwd,
      fromCliOption: passed,
      inputDir: null,
    });

    log('Option: ', option.useTimestamp);

    const logger = new CTILogger(option.verbose);
    logger.log('configuration from: ', readedFrom === '' ? 'default' : readedFrom);

    try {
      const defaultOption = getDefailtICreateTsIndexOption(cwd);
      const stringified = json5.stringify(defaultOption, null, 2);

      const headContent = (() => {
        if (option.useTimestamp) {
          return `// created from ${option.quote}create-ts-index${
            option.quote
          } ${dayjs.default().format('YYYY-MM-DD HH:mm')}`;
        }

        return `// created from ${option.quote}create-ts-index${option.quote}`;
      })();

      const addNewline = (() => {
        if (option.addNewline) {
          return '\n';
        }

        return '';
      })();

      await new Promise((resolve, reject) => {
        fs.writeFile(
          path.join(cwd, '.ctirc'),
          `${headContent}\n\n${stringified}${addNewline}`,
          (err) => {
            if (isNotEmpty(err)) {
              return reject(err);
            }

            logger.flog(chalk.green(`.ctirc create succeeded: ${option.globOptions.cwd}`));
            return resolve();
          },
        );
      });
    } catch (err) {
      logger.error(chalk.red('indexWriter: ', err.message));
      logger.error(chalk.red('indexWriter: ', err.stack));
    }
  }

  public async write(_args: {
    directories: Array<string>;
    option: ICreateTsIndexOption;
    logger: CTILogger;
  }): Promise<void> {
    throw new Error('Not implements');
  }
}
