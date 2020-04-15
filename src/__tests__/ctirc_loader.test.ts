import debug from 'debug';
import { isPass } from 'my-easy-fp';
import path from 'path';
import {
  concreteConfig,
  getDeafultOptions,
  getRCFilename,
  merging,
  readConfigRC,
} from '../options/configure';

const log = debug('ctit:create-test');

describe('loader-test-coverage', () => {
  test('load', async () => {
    const configFromExecutePath = await readConfigRC(getRCFilename('./example/rcloader'));
    const configFromWorkDir = await readConfigRC(getRCFilename('./example/rcloader'));

    const option = concreteConfig(
      merging(
        isPass(configFromExecutePath) ? configFromExecutePath.pass : getDeafultOptions(),
        isPass(configFromWorkDir) ? configFromWorkDir.pass : getDeafultOptions(),
      ),
    );

    const defaultOption = getDeafultOptions();
    defaultOption.globOptions.cwd = path.resolve('./example/rcloader');

    log(option);

    expect(option).toEqual(defaultOption);
  });
});
