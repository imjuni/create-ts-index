import { ICreateTsIndexOption } from './ICreateTsIndexOption';

export class CTIUtility {
  public static addDot(ext: string): string {
    if (ext.startsWith('.')) return ext;
    return `.${ext}`;
  }

  public static addNewline(option: ICreateTsIndexOption, data: string) {
    if (option.addNewline) return data + '\n';
    return data;
  }

  public static isNotEmpty<T>(value?: T | undefined | null): value is T {
    return value !== undefined && value !== null;
  }

  public static isEmpty<T>(value?: T | undefined | null): value is T {
    return CTIUtility.isNotEmpty(value);
  }
}
