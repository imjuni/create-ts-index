import * as util from 'util';
import * as glob from 'glob';
import * as fs from 'fs';
import * as chalk from 'chalk';
import * as path from 'path';

export interface ICreateTsIndexOption {
  addNewline?: boolean;
  useSemicolon?: boolean;
  excludes?: string[];
  targetExts?: string[];
  globOptions?: glob.IOptions;
}

function addDot(ext: string) {
  if (ext.startsWith('.')) {
    return ext;
  }

  return `.${ext}`;
}

function addNewline(option: ICreateTsIndexOption, data: string) {
  if (option.addNewline) {
    return data + '\n';
  }

  return data;
}

export async function indexWriter(
  directory: string,
  directories: string[],
  option: ICreateTsIndexOption,
): Promise<void> {
  const readDirFunc = util.promisify<string, string[]>(fs.readdir);
  const writeFileFunc = util.promisify<string, any, string>(fs.writeFile);
  const indexFiles = option.targetExts.map(targetExt => `index.${targetExt}`);

  try {
    console.log(chalk.default.yellow('Current working: ', directory));

    const resolvePath = path.resolve(option.globOptions.cwd);
    const elements = await readDirFunc(path.join(resolvePath, directory));

    const targets = elements
      .filter((element) => {
        const isTarget = option.targetExts.reduce<boolean>(
          (result, ext) => {
            return result || addDot(ext) === path.extname(element);
          },
          false,
        );

        const isHaveTarget = directories.indexOf(path.join(directory, element)) >= 0;
        const isNotIndex = indexFiles.indexOf(element) < 0;

        return (isTarget || isHaveTarget) && isNotIndex;
      });

    const exportString = targets.map((target) => {
      let targetFileWithoutExt = target;

      option.targetExts.forEach((ext) => {
        return targetFileWithoutExt = targetFileWithoutExt.replace(addDot(ext), '');
      });

      if (option.useSemicolon) {
        return `export * from './${targetFileWithoutExt}';`;
      }

      return `export * from './${targetFileWithoutExt}'`;
    });

    const fileContent = addNewline(option, exportString.join('\n'));
    await writeFileFunc(path.join(resolvePath, directory, 'index.ts'), fileContent, 'utf8');
  } catch (err) {
    console.log(chalk.default.red('indexWriter: ', err.message));
  }
}

export async function createTypeScriptIndex(_option: ICreateTsIndexOption): Promise<void> { // tslint:disable-line
  try {
    const option = Object.assign({} as ICreateTsIndexOption, _option);

    if (!option.globOptions) {
      option.globOptions = {};
    }

    option.addNewline = option.addNewline || true;
    option.useSemicolon = option.useSemicolon || true;
    option.globOptions.cwd = option.globOptions.cwd || process.cwd();
    option.globOptions.nonull = option.globOptions.nonull || true;
    option.globOptions.dot = option.globOptions.dot || true;
    option.excludes = option.excludes || ['@types', '__test__', '__tests__'];
    option.targetExts = option.targetExts || ['ts', 'tsx'];

    const targetFileGlob = option.targetExts.map(ext => `*.${ext}`).join('|');
    const globFunc = util.promisify<string, glob.IOptions, string[]>(glob);
    const allTsFiles = await globFunc(`**/+(${targetFileGlob})`, option.globOptions);

    const tsFiles = allTsFiles
      // Step 1, remove exclude directory
      .filter((tsFilePath) => {
        return !option.excludes.reduce<boolean>(
          (result, exclude) => {
            return result || tsFilePath.indexOf(exclude) >= 0;
          },
          false,
        );
      })

      // Step 2, remove declare file(*.d.ts)
      .filter(tsFilePath => !tsFilePath.endsWith('.d.ts'))

      // Step 3, remove index file(index.ts, index.tsx etc ...)
      .filter((tsFilePath) => {
        return !option.targetExts
          .map(ext => `index.${ext}`)
          .reduce<boolean>(
            (result, indexFile) => {
              return result || tsFilePath.indexOf(indexFile) >= 0;
            },
            false,
          );
      });

    const tsDirSet: Set<string> = new Set<string>(tsFiles.map(tsFile => path.dirname(tsFile)));
    const tsDirs = Array.from<string>(tsDirSet).filter(dir => dir !== '.');

    tsDirs.sort((left: string, right: string): number => {
      const llen = left.split(path.sep).length;
      const rlen = right.split(path.sep).length;

      if (llen > rlen) { return -1; }
      if (llen < rlen) { return 1; }
      return 0;
    });

    await Promise.all(tsDirs.map(tsDir => indexWriter(tsDir, tsDirs, option)));
  } catch (err) {
    console.log(chalk.default.red(err.message));
  }
}
