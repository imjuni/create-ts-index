// tslint:disable no-console

type logFunc = (message?: any, ...optionalParams: Array<any>) => void;

export class CTILogger {
  public readonly log: logFunc;
  public readonly error: logFunc;
  public readonly flog: logFunc;
  public readonly ferror: logFunc;

  constructor(verbose: boolean) {
    if (verbose) {
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
