import * as child_process from 'child_process';
import debug from 'debug';
import { readFile } from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { promisify } from 'util';
import { CleanCommandModule } from '../commands/CleanCommandModule';

const log = debug('ctit:cli-test');

const cliPath = path.resolve(path.join(__dirname, '..', 'cti.ts'));
const exampleRootPath = path.resolve(path.join(__dirname, '..', '..', 'example'));
const nodeWithTypescript = 'node --require ts-node/register ';

const exampleType01Path = path.join(exampleRootPath, 'type01');
const exampleType02Path = path.join(exampleRootPath, 'type02');
const exampleType03Path = path.join(exampleRootPath, 'type03');

describe('cti-create-test', () => {
  afterAll(async () => {
    const cmd = new CleanCommandModule();
    await cmd.do(exampleType01Path, { globOptions: { cwd: exampleType01Path } });
    log('clean directory: ', exampleType01Path);

    await cmd.do(exampleType02Path, { globOptions: { cwd: exampleType02Path } });
    log('clean directory: ', exampleType02Path);

    await cmd.do(exampleType03Path, { globOptions: { cwd: exampleType03Path } });
    log('clean directory: ', exampleType03Path);
  });

  test('create-index-type01', async () => {
    const cliCmd = `${nodeWithTypescript} ${cliPath} create ${exampleType01Path}`;

    log('cli command: ', cliCmd);

    child_process.execSync(cliCmd);

    const files = glob
      .sync('**/index.ts', { cwd: exampleType01Path })
      .map((file) => path.join(exampleType01Path, file));

    log('files-01: ', files.sort());

    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThanOrEqual(1);

    log('create file count check success');

    const promisified = promisify(readFile);
    const contentBuffers = await Promise.all(files.map((file) => promisified(file)));
    const contents = contentBuffers.map((buffer) => buffer.toString());

    log('file readed: ', contents);

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

  test('create-index-type01-1', async () => {
    const cliCmd = `${nodeWithTypescript} ${cliPath} create -w ${exampleType01Path}`;

    log('cli command: ', cliCmd);

    child_process.execSync(cliCmd);

    const files = glob
      .sync('**/index.ts', { cwd: exampleType01Path })
      .map((file) => path.join(exampleType01Path, file));

    log('files-01: ', files.sort());

    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThanOrEqual(1);

    log('create file count check success');

    const promisified = promisify(readFile);
    const contentBuffers = await Promise.all(files.map((file) => promisified(file)));
    const contents = contentBuffers.map((buffer) => buffer.toString());

    log('file readed: ', contents);

    const resultContents = [
      `export * from './export_sample01';
export * from './export_sample02';
export * from './export_sample03';
export * from './export_sample04';
`,
    ];

    expect(contents).toEqual(resultContents);
  });

  test('create-index-type02', async () => {
    const cliCmd = `${nodeWithTypescript} ${cliPath} create ${exampleType02Path}`;

    log('cli command: ', cliCmd);

    child_process.execSync(cliCmd);

    const files = glob
      .sync('**/index.ts', { cwd: exampleType02Path })
      .map((file) => path.join(exampleType02Path, file));

    log('files-02: ', files);

    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThanOrEqual(1);

    log('create file count check success');

    const promisified = promisify(readFile);
    const contentBuffers = await Promise.all(files.map((file) => promisified(file)));
    const contents = contentBuffers.map((buffer) => buffer.toString());

    log('file readed: ', contents);

    const resultContents = [
      `// created from 'create-ts-index'

export * from './juvenile';
export * from './wellmade';
export * from './BubbleCls';
export * from './ComparisonCls';
export * from './HandsomelyCls';
export * from './SampleCls';
`,
      `// created from 'create-ts-index'

export * from './spill';
export * from './TriteCls';
`,
      `// created from 'create-ts-index'

export * from './ExperienceCls';
`,
      `// created from 'create-ts-index'

export * from './DiscussionCls';
export * from './MakeshiftCls';
`,
      `// created from 'create-ts-index'

export * from './carpenter';
export * from './ChildlikeCls';
export * from './FlakyCls';
export * from './WhisperingCls';
`,
    ];

    expect(contents).toEqual(resultContents);
  });

  test('create-index-type03', async () => {
    const cliCmd = `${nodeWithTypescript} ${cliPath} create ${exampleType03Path}`;

    log('cli command: ', cliCmd);

    child_process.execSync(cliCmd);

    const files = glob
      .sync('**/index.ts', { cwd: exampleType03Path })
      .map((file) => path.join(exampleType03Path, file));

    log('files-03: ', files.sort());

    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThanOrEqual(1);

    log('create file count check success');

    const promisified = promisify(readFile);
    const contentBuffers = await Promise.all(files.map((file) => promisified(file)));
    const contents = contentBuffers.map((buffer) => buffer.toString());

    log('file readed: ', contents);

    const resultContents = [
      `// created from 'create-ts-index'

export * from './juvenile';
export * from './wellmade';
export * from './BubbleCls';
export * from './ComparisonCls';
export * from './HandsomelyCls';
export * from './SampleCls';
`,
      `// created from 'create-ts-index'

export * from './spill';
export * from './TriteCls';
`,
      `// created from 'create-ts-index'

export * from './ExperienceCls';
`,
      `// created from 'create-ts-index'

export * from './DiscussionCls';
export * from './MakeshiftCls';
`,
      `// created from 'create-ts-index'

export * from './carpenter';
export * from './ChildlikeCls';
export * from './FlakyCls';
export * from './WhisperingCls';
`,
    ];

    expect(contents).toEqual(resultContents);
  });
});
