import chalk from 'chalk';
import * as path from 'path';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from './CTILogger';
import { addDot, isNotEmpty } from './CTIUtility';

export function getExportStatementCreator(option: ICreateTsIndexOption, logger: CTILogger) {
  const targetExtWithDot = option.targetExts.map((ext) => addDot(ext));
  const pathReplacer =
    path.sep !== '/'
      ? (exportPath: string) =>
          exportPath.replace(new RegExp(path.sep.replace('\\', '\\\\'), 'g'), '/')
      : (exportPath: string) => exportPath;

  if (option.useSemicolon) {
    const getExportWithSemicolon = (target: string) => {
      const matchedExt = targetExtWithDot.find((ext) => path.extname(target) === ext);
      const targetWithoutExt = isNotEmpty(matchedExt)
        ? target.replace(matchedExt, '')
        : target;

      logger.log(chalk.green('entrypoint added from:'), target);

      return `export * from ${option.quote}./${pathReplacer(targetWithoutExt)}${
        option.quote
      };`;
    };

    return getExportWithSemicolon;
  }

  const getExport = (target: string) => {
    const matchedExt = targetExtWithDot.find((ext) => path.extname(target) === ext);
    const targetWithoutExt = isNotEmpty(matchedExt) ? target.replace(matchedExt, '') : target;

    logger.log(chalk.green('entrypoint added from:'), target);

    return `export * from ${option.quote}./${pathReplacer(targetWithoutExt)}${option.quote}`;
  };
  return getExport;
}
