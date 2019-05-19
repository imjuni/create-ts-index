// tslint:disable no-console

import debug from 'debug';
import { readFile } from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { promisify } from 'util';
import { CreateCommandModule } from '../commands/CreateCommandModule';

const log = debug('ctit:create-test');
const exampleRootPath = path.resolve(path.join(__dirname, '..', '..', 'example'));
const exampleType01Path = path.join(exampleRootPath, 'type01');

describe('cti-test', () => {
  test('create-index', async () => {
    log('cwd: ', exampleType01Path);

    const cmd = new CreateCommandModule();
    await cmd.do(exampleType01Path, { globOptions: { cwd: exampleType01Path } });

    const files = glob
      .sync('**/index.ts', { cwd: exampleType01Path })
      .map((file) => path.join(exampleType01Path, file));

    log('files: ', files);

    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThanOrEqual(1);

    log('create file count check success');

    const promisified = promisify(readFile);
    const contentBuffers = await Promise.all(files.map((file) => promisified(file)));
    const contents = contentBuffers.map((buffer) => buffer.toString());

    log('file readed: ', contents);

    const resultContents = `// created from 'create-ts-index'

export * from './export_sample01';
export * from './export_sample02';
export * from './export_sample03';
export * from './export_sample04';
`;

    expect(contents).toEqual([resultContents]);
  });
});
