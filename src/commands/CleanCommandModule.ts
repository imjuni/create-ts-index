import chalk from 'chalk';
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
import { isNotEmpty } from '../tools/CTIUtility';
import { CommandModule } from './CommandModule';
import { ICommandModule } from './ICommandModule';

export class CleanCommandModule implements ICommandModule {
  public async do(executePath: string, passed: Partial<ICreateTsIndexOption>) {
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

    logger.log(chalk.yellowBright('Option: '), option);

    const indexFiles = await CommandModule.promisify.glob('**/index.ts', {
      cwd: workDir,
      nonull: false,
    });

    const indexBackupFiles = await CommandModule.promisify.glob('**/index.ts.bak', {
      cwd: workDir,
      nonull: false,
    });

    const entrypointFiles = await CommandModule.promisify.glob('**/entrypoint.ts', {
      cwd: workDir,
      nonull: false,
    });

    const entrypointBackupFiles = await CommandModule.promisify.glob('**/entrypoint.ts.bak', {
      cwd: workDir,
      nonull: false,
    });

    const outputFiles = await CommandModule.promisify.glob(`**/${option.output}`, {
      cwd: workDir,
      nonull: false,
    });

    const outputBackupFiles = await CommandModule.promisify.glob(`**/${option.output}.bak`, {
      cwd: workDir,
      nonull: false,
    });

    const concatted = indexFiles
      .concat(indexBackupFiles)
      .concat(entrypointFiles)
      .concat(entrypointBackupFiles)
      .concat(outputFiles)
      .concat(outputBackupFiles);
    const concattedSet = new Set<string>(concatted);

    if (concatted.length === 0) {
      logger.flog(chalk.yellow(`Cannot find target file on working directory: ${workDir}`));
    }

    await Promise.all(
      Array.from(concattedSet).map((file) => {
        logger.log(chalk.redBright('delete file: '), path.join(workDir, file));
        return fs.promises.unlink(path.join(workDir, file));
      }),
    );

    logger.flog(chalk.green(`clean succeeded: ${workDir}`));
  }

  public async write(_param: {
    directories: Array<string>;
    option: ICreateTsIndexOption;
    logger: CTILogger;
  }): Promise<void> {
    throw new Error('Not Implemented');
  }
}
