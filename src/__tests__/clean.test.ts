// tslint:disable no-console
import debug from 'debug';
import * as glob from 'glob';
import * as path from 'path';
import { CleanCommandModule } from '../commands/CleanCommandModule';
import { CreateCommandModule } from '../commands/CreateCommandModule';

const log = debug('cti:clean-test');
const exampleRootPath = path.resolve(path.join(__dirname, '..', '..', 'example'));
const exampleType01Path = path.join(exampleRootPath, 'type01');

describe('cti-test', () => {
  beforeAll(async () => {
    log('index.ts file creation before cealn test');

    const cmd = new CreateCommandModule();
    await cmd.do(exampleType01Path, {});
  });

  test('index-clean', async () => {
    const cmd = new CleanCommandModule();
    await cmd.do(exampleType01Path, {});

    const files = glob.sync('**/index.ts', { cwd: exampleType01Path });

    log('files: ', files);

    expect(files).toBeDefined();
    expect(files.length).toBeLessThan(1);
  });
});
