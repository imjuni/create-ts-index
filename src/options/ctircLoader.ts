// tslint:disable no-console
import debug from 'debug';
import * as fs from 'fs';
import * as json5 from 'json5';
import * as path from 'path';
import { CTIUtility } from '../tools/CTIUtility';
import { CreateTsIndexOption } from './CreateTsIndexOption';
import { ICreateTsIndexOption } from './ICreateTsIndexOption';

const log = debug('cti:ctircLoader');
const CTIRC_FILENAME = '.ctirc';
const { isNotEmpty } = CTIUtility;

export function ctircLoader({
  inputDir,
  cwd,
  fromCliOption,
}: {
  inputDir: string | null;
  cwd: string;
  fromCliOption: Partial<ICreateTsIndexOption>;
}): { readedFrom: string; option: CreateTsIndexOption } {
  log(`inputDir: (${inputDir}) /cwd: (${cwd})`);

  // Step01. Read configuration file on parametered input directory
  const targetDirs: Array<string> = (() => {
    const _target: Array<string> = [];

    if (
      isNotEmpty(inputDir) &&
      fs.existsSync(inputDir) &&
      fs.existsSync(path.join(inputDir, CTIRC_FILENAME))
    ) {
      _target.push(inputDir);
    }

    if (fs.existsSync(cwd) && fs.existsSync(path.join(cwd, CTIRC_FILENAME))) {
      _target.push(cwd);
    }

    return _target;
  })();

  log('targetDirs: ', targetDirs);
  // Stop02. Load configuration from .ctirc
  try {
    if (targetDirs.length <= 0) {
      return {
        option: new CreateTsIndexOption(CreateTsIndexOption.getOption(fromCliOption)),
        readedFrom: 'from cli option',
      };
    }

    const fromConfigfiles = targetDirs.map((targetDir) => {
      const ctircPath = path.join(targetDir, CTIRC_FILENAME);
      const rawConf = fs.readFileSync(ctircPath).toString();
      const fromConfigfile: ICreateTsIndexOption = {
        ...json5.parse(rawConf),
        ...{ globOptions: { cwd: inputDir } },
      };

      return fromConfigfile;
    });

    const mergedCTIRC = (() => {
      if (fromConfigfiles.length > 2) {
        const [soruce, dsts] = fromConfigfiles;
        const _mergedCTIRC = CreateTsIndexOption.merge<ICreateTsIndexOption>(
          true,
          true,
          soruce,
          dsts,
        );

        return _mergedCTIRC;
      }

      const [_firstCTIRC] = fromConfigfiles;
      return _firstCTIRC;
    })();

    mergedCTIRC.__for_debug_from = 'from-config-file';
    fromCliOption.__for_debug_from = 'from-cli-option';

    const option = CreateTsIndexOption.mergeOptions(
      CreateTsIndexOption.getDefailtICreateTsIndexOption(),
      mergedCTIRC,
      fromCliOption,
    );

    log('final option: ', mergedCTIRC, fromCliOption, option);

    return { option, readedFrom: 'from config file' };
  } catch (err) {
    log(err.message);
    log(err.stacktrace);

    const option = new CreateTsIndexOption();
    return { option, readedFrom: '' };
  }
}
