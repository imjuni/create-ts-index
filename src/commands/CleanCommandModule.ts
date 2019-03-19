import * as chalk from 'chalk';
import * as path from 'path';
import { ctircLoader } from '../options/ctircLoader';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
import { CTIUtility } from '../tools/CTIUtility';
import { CommandModule } from './CommandModule';

const { isNotEmpty } = CTIUtility;

export class CleanCommandModule {
  public async do(cliCwd: string, passed: Partial<ICreateTsIndexOption>) {
    const cwd =
      isNotEmpty(passed.globOptions) && isNotEmpty(passed.globOptions.cwd)
        ? passed.globOptions.cwd
        : process.cwd();

    const { readedFrom, option } = ctircLoader({
      cwd: cliCwd,
      fromClioption: passed,
      inputDir: cwd,
    });
    const logger = new CTILogger(option.verbose);
    logger.log('configuration from: ', readedFrom === '' ? 'default' : readedFrom);

    logger.log(chalk.default.yellowBright('Option: '), option);

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
      logger.flog(
        chalk.default.yellow(`Cannot find target file on working directory: ${cwd}`),
      );
    }

    await Promise.all(
      concatted.map((file) => {
        logger.log(chalk.default.redBright('delete file: '), path.join(cwd, file));
        return CommandModule.promisify.unlink(path.join(cwd, file));
      }),
    );

    logger.flog(chalk.default.green(`clean succeeded: ${cwd}`));
  }
}
