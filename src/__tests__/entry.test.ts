// tslint:disable no-console

import debug from 'debug';
import { readFile } from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { promisify } from 'util';
import { CleanCommandModule } from '../commands/CleanCommandModule';
import { EntrypointCommandModule } from '../commands/EntrypointCommandModule';

const log = debug('ctit:create-test');
const exampleRootPath = path.resolve(path.join(__dirname, '..', '..', 'example'));
const exampleType01Path = path.join(exampleRootPath, 'type01');
const exampleType02Path = path.join(exampleRootPath, 'type02');
const exampleType03Path = path.join(exampleRootPath, 'type03');

describe('cti-test', () => {
  afterAll(async () => {
    const cmd = new CleanCommandModule();
    await cmd.do(exampleType01Path, { globOptions: { cwd: exampleType01Path } });
    log('clean directory: ', exampleType01Path);

    await cmd.do(exampleType02Path, { globOptions: { cwd: exampleType02Path } });
    log('clean directory: ', exampleType02Path);

    await cmd.do(exampleType03Path, { globOptions: { cwd: exampleType03Path } });
    log('clean directory: ', exampleType03Path);
  });

  test('create-entry-type01', async () => {
    const cmd = new EntrypointCommandModule();
    await cmd.do(exampleType01Path, { globOptions: { cwd: exampleType01Path } });

    const files = glob
      .sync('**/entrypoint.ts', { cwd: exampleType01Path })
      .map((file) => path.join(exampleType01Path, file));

    log('files-01: ', files.sort());

    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThanOrEqual(1);

    log('create file count check success');

    const promisified = promisify(readFile);
    const contentBuffers = await Promise.all(files.map((file) => promisified(file)));
    const contents = contentBuffers.map((buffer) => buffer.toString());

    const resultContents = [
      `// created from 'create-ts-index'

export * from './export_sample01';
export * from './export_sample02';
export * from './export_sample03';
export * from './export_sample04';
`,
    ];

    expect(contents).toEqual(resultContents);
  });

  test('create-entry-type02', async () => {
    const cmd = new EntrypointCommandModule();
    await cmd.do(exampleType02Path, { globOptions: { cwd: exampleType02Path } });

    const files = glob
      .sync('**/entrypoint.ts', { cwd: exampleType02Path })
      .map((file) => path.join(exampleType02Path, file));

    log('files-02: ', files.sort());

    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThanOrEqual(1);

    log('create file count check success');

    const promisified = promisify(readFile);
    const contentBuffers = await Promise.all(files.map((file) => promisified(file)));
    const contents = contentBuffers.map((buffer) => buffer.toString());

    const resultContents = [
      `// created from 'create-ts-index'

export * from './BubbleCls';
export * from './ComparisonCls';
export * from './HandsomelyCls';
export * from './SampleCls';
export * from './juvenile/TriteCls';
export * from './juvenile/spill/ExperienceCls';
export * from './wellmade/ChildlikeCls';
export * from './wellmade/FlakyCls';
export * from './wellmade/WhisperingCls';
export * from './wellmade/carpenter/DiscussionCls';
export * from './wellmade/carpenter/MakeshiftCls';
`,
    ];

    expect(contents).toEqual(resultContents);
  });

  test('create-entry-type03', async () => {
    const cmd = new EntrypointCommandModule();
    await cmd.do(exampleType03Path, { globOptions: { cwd: exampleType03Path } });

    const files = glob
      .sync('**/entrypoint.ts', { cwd: exampleType03Path })
      .map((file) => path.join(exampleType03Path, file));

    log('files-03: ', files.sort());

    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThanOrEqual(1);

    log('create file count check success');

    const promisified = promisify(readFile);
    const contentBuffers = await Promise.all(files.map((file) => promisified(file)));
    const contents = contentBuffers.map((buffer) => buffer.toString());

    const resultContents = [
      `// created from 'create-ts-index'

export * from './BubbleCls';
export * from './ComparisonCls';
export * from './HandsomelyCls';
export * from './SampleCls';
export * from './juvenile/TriteCls';
export * from './juvenile/spill/ExperienceCls';
export * from './wellmade/ChildlikeCls';
export * from './wellmade/FlakyCls';
export * from './wellmade/WhisperingCls';
export * from './wellmade/carpenter/DiscussionCls';
export * from './wellmade/carpenter/MakeshiftCls';
`,
    ];

    expect(contents).toEqual(resultContents);
  });
});
