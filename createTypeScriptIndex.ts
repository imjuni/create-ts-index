import * as moment from 'moment';
import * as util from 'util';
import * as glob from 'glob';
import * as fs from 'fs';
import * as chalk from 'chalk';
import * as path from 'path';

export interface ICreateTsIndexOption {
  fileFirst?: boolean;
  addNewline?: boolean;
  useSemicolon?: boolean;
  useTimestamp?: boolean;
  includeCWD?: boolean;
  excludes?: string[];
  fileExcludePatterns?: string[];
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
  const statFunc = util.promisify<string, fs.Stats>(fs.stat);
  const indexFiles = option.targetExts.map(targetExt => `index.${targetExt}`);

  try {
    console.log(chalk.default.yellow('Current working: ', directory));

    const resolvePath = path.resolve(option.globOptions.cwd);
    const elements = await readDirFunc(path.join(resolvePath, directory));

    const targets = elements
      .filter(element => indexFiles.indexOf(element) < 0)
      .filter((element) => {
        const isTarget = option.targetExts.reduce<boolean>(
          (result, ext) => {
            return result || addDot(ext) === path.extname(element);
          },
          false,
        );

        const isHaveTarget = directories.indexOf(path.join(directory, element)) >= 0;

        return isTarget || isHaveTarget;
      });

    const stats = await Promise.all(
      targets.map(target => statFunc(path.join(resolvePath, directory, target))),
    );

    const categorized = targets.reduce<{ dir: string[], allFiles: string[] }>(
      (result, target, index) => {
        if (stats[index].isDirectory()) {
          result.dir.push(target);
        } else {
          result.allFiles.push(target);
        }

        return result;
      },
      { dir: [], allFiles: [] },
    );

    categorized.dir.sort();

    const files = categorized.allFiles.filter((element) => {
      return !option.fileExcludePatterns.reduce<boolean>(
        (result, excludePattern) => {
          return result || element.indexOf(excludePattern) >= 0;
        },
        false,
      );
    });

    files.sort();

    const sorted = (() => {
      if (option.fileFirst) {
        return categorized.allFiles.concat(categorized.dir);
      }

      return categorized.dir.concat(files);
    })();

    const exportString = sorted.map((target) => {
      let targetFileWithoutExt = target;

      option.targetExts.forEach((ext) => {
        return targetFileWithoutExt = targetFileWithoutExt.replace(addDot(ext), '');
      });

      if (option.useSemicolon) {
        return `export * from "./${targetFileWithoutExt}";`;
      }

      return `export * from "./${targetFileWithoutExt}"`;
    });

    const comment = (() => {
      if (option.useTimestamp) {
        return `// created from 'create-ts-index' ${moment(new Date()).format('YYYY-MM-DD HH:mm')}\n\n`; // tslint:disable-line
      }
      return `// created from 'create-ts-index'\n\n`; // tslint:disable-line
    })();

    const fileContent = comment + addNewline(option, exportString.join('\n'));
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

    option.fileFirst = option.fileFirst || false;
    option.addNewline = option.addNewline || true;
    option.useSemicolon = option.useSemicolon || true;
    option.useTimestamp = option.useTimestamp || false;
    option.includeCWD = option.includeCWD || true;
    option.fileExcludePatterns = option.fileExcludePatterns || [];
    option.globOptions.cwd = option.globOptions.cwd || process.cwd();
    option.globOptions.nonull = option.globOptions.nonull || true;
    option.globOptions.dot = option.globOptions.dot || true;
    option.excludes = option.excludes || [
      '@types', 'typings', '__test__', '__tests__', 'node_modules',
    ];
    option.targetExts = option.targetExts || ['ts', 'tsx'];
    option.targetExts = option.targetExts.sort((l, r) => r.length - l.length);

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

      // Step 3, remove exclude pattern
      .filter((tsFilePath) => {
        return !option.fileExcludePatterns.reduce<boolean>(
          (result, excludePattern) => {
            return result || tsFilePath.indexOf(excludePattern) >= 0;
          },
          false,
        );
      })

      // Step 4, remove index file(index.ts, index.tsx etc ...)
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

    const dupLibDirs = tsFiles
      .filter(tsFile => tsFile.split(path.sep).length > 1)
      .map((tsFile) => {
        const splitted = tsFile.split(path.sep);
        const allPath = Array<number>(splitted.length - 1)
          .fill(0)
          .map((_, index) => index + 1)
          .map((index) => {
            const a = splitted.slice(0, index).join(path.sep);
            return a;
          });
        return allPath;
      })
      .reduce<string[]>(
        (aggregated, libPath) => {
          return aggregated.concat(libPath);
        },
        [] as string[],
      );

    const dirSet: Set<string> = new Set<string>();
    dupLibDirs.forEach(dir => dirSet.add(dir));
    tsFiles.map(tsFile => path.dirname(tsFile)).forEach(dir => dirSet.add(dir));

    const tsDirs = Array.from<string>(dirSet);

    if (option.includeCWD) {
      tsDirs.push('.');
    }

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
