// tslint:disable no-console

import * as path from 'path';
import { TypeScritIndexWriter } from '../TypeScritIndexWriter';

describe('cti-test', () => {
  test('index-clean', async () => {
    const cti = new TypeScritIndexWriter();

    await cti.clean(path.resolve('./example/type02'));
  });
});
