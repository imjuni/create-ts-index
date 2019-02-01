import { ICreateTsIndexOption } from './ICreateTsIndexOption';

export class CTIUtility {
  public static addDot(ext: string): string {
    if (ext.startsWith('.')) return ext;
    return `.${ext}`;
  }

  public static addNewline(option: ICreateTsIndexOption, data: string) {
    if (option.addNewline) return `${data}\n`;
    return data;
  }

  public static isNotEmpty<T>(value?: T | undefined | null): value is T {
    return value !== undefined && value !== null;
  }

  public static isEmpty<T>(value?: T | undefined | null): value is T {
    return CTIUtility.isNotEmpty(value);
  }

  public static parseBool(value?: unknown | undefined | null): boolean {
    if (value === undefined) {
      return false;
    }

    if (value === null) {
      return false;
    }

    // prevent 0 to false
    if (typeof value === 'number') {
      return true;
    }

    // literal 'false' to false boolean type
    if (typeof value === 'string' && value === 'false') {
      return false;
    }

    if (typeof value === 'string' && value === 'true') {
      return true;
    }

    return Boolean(value);
  }

  public static getQuote(value: string): string {
    if (value === 'd' || value === '"') {
      return '"';
    }

    return "'";
  }
}
