import debug from 'debug';
import {
  CreateTsIndexOption,
  getDefailtICreateTsIndexOption,
} from '../options/CreateTsIndexOption';
import { ctircLoader } from '../options/ctircLoader';

const log = debug('ctit:create-test');

describe('loader-test-coverage', () => {
  test('load', async () => {
    const { readedFrom, option } = ctircLoader({
      cwd: './example/rcloader',
      fromCliOption: {},
      inputDir: './example/rcloader',
    });

    const defaultOption = getDefailtICreateTsIndexOption();
    defaultOption.globOptions.cwd = './example/rcloader';
    const defaultCtiOption = CreateTsIndexOption.factory({ option: defaultOption });

    log('>> Readed from ', readedFrom);

    expect(option).toEqual(defaultCtiOption);
  });
});
