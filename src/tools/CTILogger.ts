// tslint:disable no-console
import { CreateTsIndexOption } from '../options/CreateTsIndexOption';

type logFunc = (message?: any, ...optionalParams: any[]) => void;

export class CTILogger {
  public readonly log: logFunc;
  public readonly error: logFunc;
  public readonly flog: logFunc;
  public readonly ferror: logFunc;

  constructor(option: CreateTsIndexOption) {
    if (option.verbose) {
      this.log = console.log;
      this.error = console.error;
    } else {
      this.log = () => {
        return;
      };
      this.error = console.error;
    }

    this.flog = console.log;
    this.ferror = console.error;
  }
}
