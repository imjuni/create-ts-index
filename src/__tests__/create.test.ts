// tslint:disable no-console

import * as path from 'path';
import { TypeScritIndexWriter } from '../TypeScritIndexWriter';
import { ICreateTsIndexOption } from '../ICreateTsIndexOption';

describe('cti-test', () => {
  test('index-build', async () => {
    const option: ICreateTsIndexOption = TypeScritIndexWriter.getDefaultOption();
    const cti = new TypeScritIndexWriter();

    option.globOptions.cwd = path.resolve('./example/type02');

    await cti.create(option);
  });
});
