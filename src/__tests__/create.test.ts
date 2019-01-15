// tslint:disable no-console

import * as path from 'path';
import { ICreateTsIndexOption } from '../ICreateTsIndexOption';
import { TypeScritIndexWriter } from '../TypeScritIndexWriter';

describe('cti-test', () => {
  test('index-build', async () => {
    const option: ICreateTsIndexOption = TypeScritIndexWriter.getDefaultOption();
    const cti = new TypeScritIndexWriter();

    option.verbose = true;
    option.globOptions.cwd = path.resolve('./example/type02');

    await cti.create(option);
  });
});
