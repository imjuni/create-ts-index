import chalk from 'chalk';
import * as path from 'path';
import { ctircLoader } from '../options/ctircLoader';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
import { isNotEmpty } from '../tools/CTIUtility';
import { CommandModule } from './CommandModule';
import { ICommandModule } from './ICommandModule';

export class CleanCommandModule implements ICommandModule {
  public async do(cliCwd: string, passed: Partial<ICreateTsIndexOption>) {
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

    logger.log(chalk.yellowBright('Option: '), option);

    const indexFiles = await CommandModule.promisify.glob('**/index.ts', {
      cwd,
      nonull: false,
    });

    const entrypointFiles = await CommandModule.promisify.glob('**/entrypoint.ts', {
      cwd,
      nonull: false,
    });

    const concatted = indexFiles.concat(entrypointFiles);

    if (concatted.length === 0) {
      logger.flog(chalk.yellow(`Cannot find target file on working directory: ${cwd}`));
    }

    await Promise.all(
      concatted.map((file) => {
        logger.log(chalk.redBright('delete file: '), path.join(cwd, file));
        return CommandModule.promisify.unlink(path.join(cwd, file));
      }),
    );

    logger.flog(chalk.green(`clean succeeded: ${cwd}`));
  }

  public async write(_param: {
    directories: Array<string>;
    option: ICreateTsIndexOption;
    logger: CTILogger;
  }): Promise<void> {
    throw new Error('Not Implemented');
  }
}
