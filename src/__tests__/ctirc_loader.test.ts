// tslint:disable no-console
import { CreateTsIndexOption } from '../options/CreateTsIndexOption';
import { ctircLoader } from '../options/ctiRcLoader';

describe('loader-test-coverage', () => {
  test('load', async () => {
    const { readedFrom, option } = ctircLoader({
      cwd: './example/rcloader',
      fromClioption: {},
      inputDir: './example/rcloader',
    });

    const defaultOption = CreateTsIndexOption.getDefailtICreateTsIndexOption();
    defaultOption.globOptions.cwd = './example/rcloader';

    console.log('>> Readed from ', readedFrom);

    expect(option).toEqual(defaultOption);
  });
});
