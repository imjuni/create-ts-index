import { CreateCommandModule } from './commands/CreateCommandModule';
import { EntrypointCommandModule } from './commands/EntrypointCommandModule';
import { getDeafultOptions } from './options/configure';
import { ICreateTsIndexOption } from './options/ICreateTsIndexOption';
import { isNotEmpty } from './tools/CTIUtility';

export class TypeScritIndexWriter {
  public getDefaultOption(cwd?: string): ICreateTsIndexOption {
    if (isNotEmpty(cwd)) {
      const option = getDeafultOptions();
      option.globOptions.cwd = cwd;

      return option;
    }

    return getDeafultOptions();
  }

  public async create(option: ICreateTsIndexOption, _cliCwd?: string): Promise<void> {
    const cliCwd: string = (() => {
      if (isNotEmpty(_cliCwd)) {
        return _cliCwd;
      }

      if (isNotEmpty(option.globOptions.cwd)) {
        return option.globOptions.cwd;
      }

      return process.cwd();
    })();

    const createCommand = new CreateCommandModule();
    const result = await createCommand.do(cliCwd, option);
    return result;
  }

  public async createEntrypoint(
    option: ICreateTsIndexOption,
    _cliCwd?: string,
  ): Promise<void> {
    const cliCwd: string = (() => {
      if (isNotEmpty(_cliCwd)) {
        return _cliCwd;
      }

      if (isNotEmpty(option.globOptions.cwd)) {
        return option.globOptions.cwd;
      }

      return process.cwd();
    })();

    const entrypointCommand = new EntrypointCommandModule();
    const result = await entrypointCommand.do(cliCwd, option);
    return result;
  }
}
