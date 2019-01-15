// tslint:disable no-console

import * as path from 'path';
import { ICreateTsIndexOption } from '../ICreateTsIndexOption';
import { TypeScritIndexWriter } from '../TypeScritIndexWriter';

describe('cti-test', () => {
  test('entry-build', async () => {
    const option: ICreateTsIndexOption = TypeScritIndexWriter.getDefaultOption();
    const cti = new TypeScritIndexWriter();

    option.verbose = true;
    option.globOptions.cwd = path.resolve('./example/type02');

    await cti.createEntrypoint(option);
  });
});
