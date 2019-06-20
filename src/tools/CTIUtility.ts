import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';

export function addDot(ext: string): string {
  if (ext.startsWith('.')) return ext;
  return `.${ext}`;
}

export function addNewline(option: ICreateTsIndexOption, data: string) {
  if (option.addNewline) return `${data}\n`;
  return data;
}

export function isFalsy(value: boolean): boolean {
  return !value;
}

export function isNotEmpty<T>(value?: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function isEmpty<T>(value?: T | undefined | null): value is T {
  return !isNotEmpty(value);
}

export function parseBool(value?: unknown | undefined | null): boolean {
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

export function getQuote(value: string): string {
  if (value === 'd' || value === '"') {
    return '"';
  }

  return "'";
}

export default {
  addDot,
  addNewline,
  getQuote,
  isEmpty,
  isNotEmpty,
  parseBool,
};
