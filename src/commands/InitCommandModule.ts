import chalk from 'chalk';
import dayjs from 'dayjs';
import debug from 'debug';
import * as fs from 'fs';
import json5 from 'json5';
import { isPass } from 'my-easy-fp';
import * as path from 'path';
import {
  concreteConfig,
  getDeafultOptions,
  getRCFilename,
  merging,
  readConfigRC,
} from '../options/configure';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
import { isNotEmpty } from '../tools/CTIUtility';
import { ICommandModule } from './ICommandModule';

const log = debug('cti:InitCommandModule');

export class InitCommandModule implements ICommandModule {
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
          isPass(configFromExecutePath) ? configFromExecutePath.pass : getDeafultOptions(),
          isPass(configFromWorkDir) ? configFromWorkDir.pass : getDeafultOptions(),
        ),
        passed,
      ),
    );

    log('readed option: ', option);

    const logger = new CTILogger(option.verbose);

    try {
      const defaultOption = getDeafultOptions();
      const stringified = json5.stringify(defaultOption, null, 2);

      const headContent = (() => {
        if (option.useTimestamp) {
          return `// created from ${option.quote}create-ts-index${
            option.quote
          } ${dayjs().format('YYYY-MM-DD HH:mm')}`;
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
          path.join(workDir, '.ctirc'),
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
