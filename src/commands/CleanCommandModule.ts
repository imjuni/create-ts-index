import * as chalk from 'chalk';
import * as path from 'path';
import { CreateTsIndexOption } from '../options/CreateTsIndexOption';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
import { CommandModule } from './CommandModule';

export class CleanCommandModule {
  public async do(passed: Partial<ICreateTsIndexOption>) {
    const option: CreateTsIndexOption = CreateTsIndexOption.factory({
      partialOption: passed,
    });

    const logger = new CTILogger(option);

    logger.log(chalk.default.yellowBright('Option: '), option);

    const cwd: string = option.globOptions.cwd!;
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
