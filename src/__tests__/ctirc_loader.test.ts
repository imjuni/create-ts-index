import debug from 'debug';
import * as TEI from 'fp-ts/Either';
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
        TEI.isRight(configFromExecutePath) ? configFromExecutePath.right : getDeafultOptions(),
        TEI.isRight(configFromWorkDir) ? configFromWorkDir.right : getDeafultOptions(),
      ),
    );

    const defaultOption = getDeafultOptions();
    defaultOption.globOptions.cwd = process.cwd();

    log(option);

    expect(option).toEqual(defaultOption);
  });
});
