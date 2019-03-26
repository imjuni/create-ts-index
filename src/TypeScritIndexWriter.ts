import { CreateCommandModule } from './commands/CreateCommandModule';
import { EntrypointCommandModule } from './commands/EntrypointCommandModule';
import { CreateTsIndexOption } from './options/CreateTsIndexOption';
import { CTIUtility } from './tools/CTIUtility';

const { isNotEmpty } = CTIUtility;

export class TypeScritIndexWriter {
  public getDefaultOption(cwd?: string): CreateTsIndexOption {
    if (isNotEmpty(cwd)) {
      const optionWithCwd = CreateTsIndexOption.getOption({});
      optionWithCwd.globOptions.cwd = cwd;

      return new CreateTsIndexOption(optionWithCwd);
    }

    const option = CreateTsIndexOption.getOption({});
    return new CreateTsIndexOption(option);
  }

  public async create(option: CreateTsIndexOption, _cliCwd?: string): Promise<void> {
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

  public async createEntrypoint(option: CreateTsIndexOption, _cliCwd?: string): Promise<void> {
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
