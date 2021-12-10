import * as fs from 'fs';
import { isEmpty } from 'my-easy-fp';

/**
 * check file existing, if file exists return true, don't exists return false
 * @param filepath filename with path
 */
export async function exists(filepath: string): Promise<boolean> {
  try {
    const accessed = await fs.promises.access(filepath);
    return isEmpty(accessed);
  } catch (err) {
    return false;
  }
}
